'use client'

import { useMemo, useState } from 'react'
import { Calendar, Clock3, MapPin, Phone, Sparkles, Stethoscope, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  CitaAgendada,
  Mascotas,
  Servicios,
  VeterinarioAgenda,
  VeterinarioServicio,
} from '@/lib/types'

interface ListaVeterinariosViewProps {
  servicios: Servicios[]
  mascotas: Mascotas[]
  veterinarioServicios: VeterinarioServicio[]
  agendaVeterinarios: VeterinarioAgenda[]
  citasAgendadas: CitaAgendada[]
  onAgendarCita: (cita: Omit<CitaAgendada, 'id'>) => void
}

interface ServicioProfesional {
  id: number
  nombre: string
  especialidad: string
  direccion: string
  telefono: string
  precio: number
  disponibilidad: string
  horario: string
  horariosDisponibles: string[]
}

interface ServicioConEspecialistas extends Servicios {
  profesionales: ServicioProfesional[]
}

export function ListaVeterinariosView({
  servicios,
  mascotas,
  veterinarioServicios,
  agendaVeterinarios,
  citasAgendadas,
  onAgendarCita,
}: ListaVeterinariosViewProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServicioConEspecialistas | null>(null)
  const [formData, setFormData] = useState({
    mascota: mascotas[0]?.Nombre || '',
    veterinarioId: '',
    fecha: '',
    hora: '',
    motivo: '',
  })

  const serviciosConEspecialistas = useMemo(
    () =>
      servicios.map((servicio) => {
        const profesionalesReales: ServicioProfesional[] = veterinarioServicios
          .filter((item) => item.fk_servicio === servicio.id_servicio)
          .map((item) => {
            const agenda = agendaVeterinarios.filter(
              (entry) => entry.fk_veterinario === item.fk_veterinario && entry.disponible
            )

            return {
              id: item.fk_veterinario,
              nombre: item.veterinario_nombre,
              especialidad: item.especialidad,
              direccion: item.direccion,
              telefono: item.telefono,
              precio: item.precio,
              disponibilidad: agenda.map((entry) => entry.dia).join(', ') || 'Agenda por confirmar',
              horario:
                agenda.map((entry) => `${entry.hora_inicio}-${entry.hora_fin}`).join(' • ') ||
                'Sin horarios registrados',
              horariosDisponibles: agenda.map((entry) => entry.hora_inicio),
            }
          })

        const profesionales = profesionalesReales.length > 0 ? profesionalesReales : []

        return {
          ...servicio,
          profesionales,
        }
      }),
    [agendaVeterinarios, servicios, veterinarioServicios]
  )

  const selectedVet = selectedService?.profesionales.find(
    (profesional) => profesional.id === Number(formData.veterinarioId)
  )

  const openBooking = (servicio: ServicioConEspecialistas) => {
    const firstVet = servicio.profesionales[0]

    setSelectedService(servicio)
    setFormData({
      mascota: mascotas[0]?.Nombre || '',
      veterinarioId: firstVet ? String(firstVet.id) : '',
      fecha: '',
      hora: firstVet?.horariosDisponibles[0] || '09:00',
      motivo: '',
    })
    setIsBookingOpen(true)
  }

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService || !selectedVet) {
      return
    }

    onAgendarCita({
      servicio: selectedService.nombre,
      mascota: formData.mascota,
      veterinario: selectedVet.nombre,
      fecha: formData.fecha,
      hora: formData.hora,
      direccion: selectedVet.direccion,
      motivo: formData.motivo,
    })

    setIsBookingOpen(false)
  }

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-in fade-in duration-500 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Servicios Disponibles</h2>
        <p className="text-slate-500 text-lg">
          Elige el servicio que necesitas y agenda ahí mismo con el veterinario que prefieras.
        </p>
        {/* DEBUG */}
        <p className="text-xs text-gray-400 mt-2">
          Debug: Servicios={servicios.length}, Vets={veterinarioServicios.length}, Agenda={agendaVeterinarios.length}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {serviciosConEspecialistas.map((servicio) => (
          <div
            key={servicio.id_servicio}
            className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{servicio.nombre}</h3>
                    <p className="text-slate-600 mt-1 max-w-xl">{servicio.descripción}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Desde</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <Sparkles className="w-4 h-4" />
                {servicio.profesionales.length} veterinario(s) disponibles para este servicio
              </div>

              {veterinarioServicios.filter((item) => item.fk_servicio === servicio.id_servicio).length === 0 && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  Mostrando veterinarios de plantilla mientras completas la información real en la base de datos.
                </div>
              )}

              {servicio.profesionales.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  Aún no hay veterinarios asignados a este servicio.
                </div>
              ) : (
                servicio.profesionales.map((profesional) => (
                  <div
                    key={`${servicio.id_servicio}-${profesional.id}`}
                    className="rounded-2xl border border-slate-200 p-5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900">{profesional.nombre}</h4>
                        <p className="text-blue-600 text-sm font-medium">{profesional.especialidad}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm font-semibold">
                        ${profesional.precio.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{profesional.direccion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{profesional.telefono}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{profesional.disponibilidad}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-slate-400" />
                        <span>{profesional.horario}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <Button
                onClick={() => openBooking(servicio)}
                disabled={servicio.profesionales.length === 0}
                className="w-full py-6 bg-slate-900 hover:bg-blue-600 rounded-2xl font-bold"
              >
                Agendar este servicio
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Mis citas</h3>
            <p className="text-slate-500">Aquí se guardan las citas que agendas desde servicios.</p>
          </div>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {citasAgendadas.length} agendada(s)
          </span>
        </div>

        {citasAgendadas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            Aún no has agendado citas desde esta sección.
          </div>
        ) : (
          <div className="grid gap-4">
            {citasAgendadas.map((cita) => (
              <div key={cita.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">{cita.servicio}</p>
                    <p className="text-sm text-slate-500">
                      {cita.mascota} con {cita.veterinario}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {cita.fecha} · {cita.hora}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{cita.motivo}</p>
                <p className="mt-2 text-sm text-slate-500">{cita.direccion}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isBookingOpen && selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsBookingOpen(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Agendar cita</h3>
                <p className="text-blue-100 text-sm">{selectedService.nombre}</p>
              </div>
              <button type="button" onClick={() => setIsBookingOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="p-8 space-y-4">
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

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Veterinario</label>
                <select
                  value={formData.veterinarioId}
                  onChange={(e) => {
                    const vet = selectedService.profesionales.find(
                      (item) => item.id === Number(e.target.value)
                    )
                    setFormData((prev) => ({
                      ...prev,
                      veterinarioId: e.target.value,
                      hora: vet?.horariosDisponibles[0] || '09:00',
                    }))
                  }}
                  className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none"
                >
                  {selectedService.profesionales.map((profesional) => (
                    <option key={profesional.id} value={profesional.id}>
                      {profesional.nombre} · {profesional.especialidad}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">{selectedVet?.direccion}</p>
                <p className="mt-1">
                  Horarios sugeridos:{' '}
                  {selectedVet?.horariosDisponibles.join(', ') || 'Agenda por confirmar'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                    className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Hora</label>
                  <select
                    value={formData.hora}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hora: e.target.value }))}
                    className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none"
                  >
                    {(selectedVet?.horariosDisponibles.length
                      ? selectedVet.horariosDisponibles
                      : ['09:00']).map((hora) => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Motivo</label>
                <textarea
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, motivo: e.target.value }))}
                  className="w-full mt-1 p-3 bg-slate-100 rounded-xl outline-none h-24 resize-none"
                  placeholder="Describe brevemente el motivo de la cita"
                />
              </div>

              <Button type="submit" className="w-full py-6 bg-blue-600 rounded-xl font-bold hover:bg-blue-700">
                Confirmar cita
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
