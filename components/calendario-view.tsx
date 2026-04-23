'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, Clock, Info, MapPin } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { CitaAgendada } from '@/lib/types'

interface CalendarioViewProps {
  citas: CitaAgendada[]
}

const parseDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export function CalendarioView({ citas }: CalendarioViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const fechasConCitas = useMemo(() => citas.map((cita) => parseDate(cita.fecha)), [citas])

  const citasDelDia = useMemo(() => {
    if (!selectedDate) {
      return citas
    }

    const selectedDateText = selectedDate.toISOString().slice(0, 10)
    return citas.filter((cita) => cita.fecha === selectedDateText)
  }, [citas, selectedDate])

  {/*sECCIÓN EN LA CUAL SE MANDA EL WAHTSAPP */}
  const abrirWhatsapp = (telefono: string, veterinario: string, fecha: string, hora: string) => {
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
                    <div>
                      <p className="text-lg font-bold text-slate-900">{cita.servicio}</p>
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
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold uppercase text-emerald-700">WhatsApp</p>
                    <p className="mt-1 text-sm text-emerald-900">
                      Aqui puedes colocar el boton para enviar recordatorio al cliente.
                    </p>
                    {/* endiente checar los parámetros de los numeros de telefono de los veterinarios a los clientes*/}
                    <button className="mt-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                    onClick={() => abrirWhatsapp()}>
                      Enviar recordatorio por WhatsApp
                    </button>
                  </div>
        </div>
        
      </div>
    </div>
  )
}
