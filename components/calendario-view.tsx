'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, Clock, Info, MapPin, CheckCircle2, Timer, XCircle } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { CitaAgendada } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface CalendarioViewProps {
  citas: CitaAgendada[]
  onUpdateCitaStatus?: (id: number, nuevoEstado: string) => void
}

const parseDate = (date: string) => {
  if (!date) return new Date()
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export function CalendarioView({ citas, onUpdateCitaStatus }: CalendarioViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const fechasConCitas = useMemo(() => citas.map((cita) => parseDate(cita.fecha)), [citas])

  const citasDelDia = useMemo(() => {
    if (!selectedDate) {
      return citas
    }

    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const selectedDateText = `${year}-${month}-${day}`
    return citas.filter((cita) => cita.fecha === selectedDateText)
  }, [citas, selectedDate])

  const getStatusConfig = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'aceptada':
      case 'confirmada':
        return { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: CheckCircle2 }
      case 'finalizada':
      case 'completada':
        return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 }
      case 'cancelada':
        return { color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle }
      case 'agendada':
      case 'pendiente':
      default:
        return { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Timer }
    }
  }

  {/*sECCIÓN EN LA CUAL SE MANDA EL WAHTSAPP */}
  const abrirWhatsapp = (
    telefono = '',
    veterinario = '',
    fecha = '',
    hora = ''
  ) => {
    if (!telefono) {
      return
    }

    const mensaje = encodeURIComponent(`Te recordamos que tienes una cita con el Veterinario ${veterinario} el día ${fecha} a las ${hora}. ¡No olvides llevar a tu mascota!`)
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank')
  }

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mi Agenda</h2>
        <p className="text-slate-500 text-lg">
          Revisa tus citas en el calendario y abre cada fecha para ver el detalle.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[420px_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Calendario de agenda</p>
              <p className="text-sm text-slate-500">Selecciona un día para ver lo programado.</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
              modifiers={{ booked: fechasConCitas }}
              modifiersClassNames={{
                booked:
                  'relative after:absolute after:bottom-1.5 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-emerald-500',
              }}
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Detalle del día</h3>
              <p className="text-slate-500">
                {selectedDate
                  ? `Citas para ${selectedDate.toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}`
                  : 'Todas las citas registradas'}
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {citasDelDia.length} cita(s)
            </span>
          </div>

          {citasDelDia.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              No hay citas programadas para esta fecha.
            </div>
          ) : (
            <div className="space-y-4">
              {citasDelDia.map((cita) => (
                <div key={cita.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-lg font-bold text-slate-900">{cita.servicio}</p>
                        {(() => {
                          const config = getStatusConfig(cita.estado)
                          const StatusIcon = config.icon
                          return (
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {cita.estado || 'Agendada'}
                            </div>
                          )
                        })()}
                      </div>
                      <p className="text-sm text-slate-500">{cita.mascota}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {cita.fecha} · {cita.hora}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="flex gap-3">
                      <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Hora</p>
                        <p className="text-sm font-semibold text-slate-800">{cita.hora}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Ubicación</p>
                        <p className="text-sm font-semibold text-slate-800">{cita.direccion}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-blue-400">Motivo</p>
                      <p className="text-sm text-slate-700">{cita.motivo}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <p className="w-full text-[10px] font-bold uppercase text-slate-400 mb-1">Cambiar Estado</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs rounded-lg border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      onClick={() => onUpdateCitaStatus?.(cita.id, 'Aceptada')}
                      disabled={cita.estado === 'Aceptada'}
                    >
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      onClick={() => onUpdateCitaStatus?.(cita.id, 'Finalizada')}
                      disabled={cita.estado === 'Finalizada'}
                    >
                      Completar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs rounded-lg border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      onClick={() => onUpdateCitaStatus?.(cita.id, 'Cancelada')}
                      disabled={cita.estado === 'Cancelada'}
                    >
                      Cancelar
                    </Button>
                  </div>

                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold uppercase text-emerald-700">WhatsApp</p>
                    <p className="mt-1 text-sm text-emerald-900">
                      Enviar recordatorio personalizado al cliente para esta cita.
                    </p>
                    <button
                      className="mt-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                      onClick={() => abrirWhatsapp('993XXXXXXX', cita.veterinario, cita.fecha, cita.hora)}
                    >
                      Enviar por WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
