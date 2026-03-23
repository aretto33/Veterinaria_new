'use client'

import { Calendar, Clock3, MapPin, Phone, Sparkles, Stethoscope } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { agendasVeterinarios, perfilesVeterinarios, preciosVeterinarios, veterinarios } from '@/lib/mock-data'
import { Servicios } from '@/lib/types'

interface ListaVeterinariosViewProps {
  servicios: Servicios[]
}

export function ListaVeterinariosView({ servicios }: ListaVeterinariosViewProps) {
  const serviciosConEspecialistas = servicios.map((servicio) => {
    const profesionales = preciosVeterinarios
      .filter((item) => item.fk_servicio === servicio.id_servicio)
      .map((item) => {
        const veterinario = veterinarios.find((vet) => vet.id_Veterinario === item.fk_veterinario)
        const perfil = perfilesVeterinarios.find((entry) => entry.fk_Usuario === veterinario?.id)
        const agenda = agendasVeterinarios.filter(
          (entry) => entry.fk_veterinario === item.fk_veterinario && entry.disponible
        )

        if (!veterinario || !perfil) {
          return null
        }

        return {
          id: veterinario.id_Veterinario,
          nombre: `${perfil.Nombre} ${perfil.Apellidos}`,
          especialidad: veterinario.Especialidad,
          direccion: veterinario.direcc_consultorio,
          telefono: String(perfil.telefono),
          precio: item.precio,
          disponibilidad: agenda.map((entry) => entry.dia).join(', ') || 'Agenda por confirmar',
          horario:
            agenda.find((entry) => entry.horarios.length > 0)?.horarios.join(' • ') ||
            'Sin horarios registrados',
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    return {
      ...servicio,
      profesionales,
    }
  })

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Servicios Disponibles</h2>
        <p className="text-slate-500 text-lg">
          Revisa cada servicio y descubre qué veterinarios pueden atenderlo.
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
                  <p className="text-2xl font-black text-slate-900">${servicio.precio.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <Sparkles className="w-4 h-4" />
                {servicio.profesionales.length} veterinario(s) disponibles para este servicio
              </div>

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

              <Button className="w-full py-6 bg-slate-900 hover:bg-blue-600 rounded-2xl font-bold">
                Solicitar este servicio
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
