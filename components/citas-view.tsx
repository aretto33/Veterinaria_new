'use client'

import { useMemo, useState } from 'react'
import { Calendar, Clock, Info, MapPin, Plus, Trash2, User as UserIcon, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { agendasVeterinarios, perfilesVeterinarios, preciosVeterinarios, veterinarios } from '@/lib/mock-data'
import { Mascotas, Servicios } from '@/lib/types'

interface CitasViewProps {
  mascotas: Mascotas[]
  servicios: Servicios[]
}

interface CitaUi {
  id: number
  mascota: string
  servicio: string
  fecha: string
  hora: string
  motivo: string
  veterinario: string
  direccion: string
  descripcion: string
}

const initialCitas: CitaUi[] = [
  {
    id: 1,
    mascota: 'Luna',
    servicio: 'Vacunación',
    fecha: '2026-03-15',
    hora: '10:00',
    motivo: 'Vacunación anual',
    veterinario: 'María García López',
    direccion: 'Av. Principal #123, Consultorio 4',
    descripcion: 'Refuerzo de vacuna quíntuple y revisión general.',
  },
]

export function CitasView({ mascotas, servicios }: CitasViewProps) {
  const [selectedCita, setSelectedCita] = useState<CitaUi | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [citas, setCitas] = useState<CitaUi[]>(initialCitas)
  const [formData, setFormData] = useState({
    mascota: mascotas[0]?.Nombre || '',
    servicioId: String(servicios[0]?.id_servicio || ''),
    veterinarioId: '',
    fecha: '',
    hora: '',
    motivo: '',
    descripcion: '',
  })

  const veterinariosDisponibles = useMemo(() => {
    const servicioId = Number(formData.servicioId)
    if (!servicioId) {
      return []
    }

    return preciosVeterinarios
      .filter((item) => item.fk_servicio === servicioId)
      .map((item) => {
        const veterinario = veterinarios.find((vet) => vet.id_Veterinario === item.fk_veterinario)
        const perfil = perfilesVeterinarios.find((entry) => entry.fk_Usuario === veterinario?.id)
        const agenda = agendasVeterinarios.find(
          (entry) => entry.fk_veterinario === item.fk_veterinario && entry.disponible && entry.horarios.length > 0
        )

        if (!veterinario || !perfil) {
          return null
        }

        return {
          id: veterinario.id_Veterinario,
          nombre: `${perfil.Nombre} ${perfil.Apellidos}`,
          especialidad: veterinario.Especialidad,
          direccion: veterinario.direcc_consultorio,
          precio: item.precio,
          horarios: agenda?.horarios || [],
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [formData.servicioId])

  const handleOpenModal = () => {
    const firstServicioId = String(servicios[0]?.id_servicio || '')
    const firstVetId = firstServicioId
      ? String(
          preciosVeterinarios.find((item) => item.fk_servicio === Number(firstServicioId))?.fk_veterinario || ''
        )
      : ''

    setFormData({
      mascota: mascotas[0]?.Nombre || '',
      servicioId: firstServicioId,
      veterinarioId: firstVetId,
      fecha: '',
      hora: '',
      motivo: '',
      descripcion: '',
    })
    setIsAdding(true)
  }

  const handleServicioChange = (servicioId: string) => {
    const firstVetId = String(
      preciosVeterinarios.find((item) => item.fk_servicio === Number(servicioId))?.fk_veterinario || ''
    )

    setFormData((prev) => ({
      ...prev,
      servicioId,
      veterinarioId: firstVetId,
      hora: '',
    }))
  }

  const handleSaveCita = (e: React.FormEvent) => {
    e.preventDefault()

    const servicio = servicios.find((item) => item.id_servicio === Number(formData.servicioId))
    const veterinario = veterinariosDisponibles.find((item) => item.id === Number(formData.veterinarioId))

    if (!servicio || !veterinario) {
      return
    }

    const nuevaCita: CitaUi = {
      id: citas.length + 1,
      mascota: formData.mascota,
      servicio: servicio.nombre,
      fecha: formData.fecha,
      hora: formData.hora,
      motivo: formData.motivo,
      veterinario: veterinario.nombre,
      direccion: veterinario.direccion,
      descripcion: formData.descripcion || 'Sin descripción adicional.',
    }

    setCitas((prev) => [...prev, nuevaCita])
    setIsAdding(false)
  }

  return (
    <div className="p-8 min-h-screen bg-slate-50/50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Citas</h2>
          <p className="text-slate-500">Agenda citas por servicio y elige el veterinario disponible.</p>
        </div>
        <Button
          onClick={handleOpenModal}
          className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md rounded-xl px-6 py-6"
        >
          <Plus className="w-5 h-5" /> Agendar Cita
        </Button>
      </div>

      <div className="grid gap-4">
        {citas.map((cita) => (
          <div
            key={cita.id}
            onClick={() => setSelectedCita(cita)}
            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group animate-in slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{cita.mascota}</h4>
                <p className="text-sm text-slate-500">
                  {cita.servicio} • {cita.fecha} • {cita.hora}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Detalles
            </span>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Nueva Cita</h3>
              <button type="button" onClick={() => setIsAdding(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveCita} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Mascota</label>
                <select
                  value={formData.mascota}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mascota: e.target.value }))}
                  className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none"
                >
                  {mascotas.map((mascota) => (
                    <option key={mascota.id} value={mascota.Nombre}>
                      {mascota.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Servicio</label>
                  <select
                    value={formData.servicioId}
                    onChange={(e) => handleServicioChange(e.target.value)}
                    className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none"
                  >
                    {servicios.map((servicio) => (
                      <option key={servicio.id_servicio} value={servicio.id_servicio}>
                        {servicio.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Veterinario</label>
                  <select
                    value={formData.veterinarioId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, veterinarioId: e.target.value }))}
                    className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none"
                  >
                    {veterinariosDisponibles.map((veterinario) => (
                      <option key={veterinario.id} value={veterinario.id}>
                        {veterinario.nombre} • {veterinario.especialidad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
                {veterinariosDisponibles.find((item) => item.id === Number(formData.veterinarioId)) ? (
                  <>
                    <p className="font-semibold text-slate-800">
                      {
                        veterinariosDisponibles.find((item) => item.id === Number(formData.veterinarioId))
                          ?.direccion
                      }
                    </p>
                    <p className="mt-1">
                      Horarios sugeridos:{' '}
                      {veterinariosDisponibles
                        .find((item) => item.id === Number(formData.veterinarioId))
                        ?.horarios.join(', ') || 'Agenda por confirmar'}
                    </p>
                  </>
                ) : (
                  <p>No hay veterinarios disponibles para este servicio.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Fecha</label>
                  <input
                    value={formData.fecha}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                    type="date"
                    required
                    className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Hora</label>
                  <input
                    value={formData.hora}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hora: e.target.value }))}
                    type="time"
                    required
                    className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Motivo</label>
                <input
                  value={formData.motivo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, motivo: e.target.value }))}
                  required
                  className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none"
                  placeholder="Ej. Revisión dental"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none h-24 resize-none"
                  placeholder="Detalles adicionales..."
                />
              </div>
              <Button type="submit" className="w-full py-6 bg-blue-600 rounded-xl font-bold">
                Confirmar Cita
              </Button>
            </form>
          </div>
        </div>
      )}

      {selectedCita && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setSelectedCita(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Detalles de la Cita</h3>
                <p className="text-blue-100 text-sm">Paciente: {selectedCita.mascota}</p>
              </div>
              <button type="button" onClick={() => setSelectedCita(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="p-2 h-fit bg-slate-100 rounded-lg text-slate-600">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Veterinario</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedCita.veterinario}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="p-2 h-fit bg-slate-100 rounded-lg text-slate-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-bold">Horario</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedCita.fecha} • {selectedCita.hora}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 h-fit bg-slate-100 rounded-lg text-slate-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Ubicación</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedCita.direccion}</p>
                </div>
              </div>

              <div className="flex gap-3 border-t pt-6">
                <div className="p-2 h-fit bg-blue-50 rounded-lg text-blue-600">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-blue-400 font-bold">Servicio y motivo</p>
                  <p className="text-sm text-slate-700 leading-relaxed mt-1">
                    <span className="font-bold">{selectedCita.servicio}:</span> {selectedCita.motivo}.{' '}
                    {selectedCita.descripcion}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3">
              <Button variant="outline" onClick={() => setSelectedCita(null)} className="flex-1 rounded-xl">
                Cerrar
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2 rounded-xl"
                onClick={() => {
                  setCitas((prev) => prev.filter((cita) => cita.id !== selectedCita.id))
                  setSelectedCita(null)
                }}
              >
                <Trash2 className="w-4 h-4" /> Cancelar cita
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
