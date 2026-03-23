'use client'
import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, Bell, Scissors, Stethoscope, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CalendarioView() {
  const [date, setDate] = useState(new Date())

  // Datos simulados de la agenda del veterinario logueado
  const agendaHoy = [
    { id: 1, hora: '09:00 AM', mascota: 'Luna', servicio: 'Vacunación', tipo: 'medico', estado: 'completado' },
    { id: 2, hora: '11:30 AM', mascota: 'Rocky', servicio: 'Cirugía (Quirófano 1)', tipo: 'cirugia', estado: 'pendiente' },
    { id: 3, hora: '02:00 PM', mascota: 'Michi', servicio: 'Control General', tipo: 'medico', estado: 'pendiente' },
    { id: 4, hora: '04:30 PM', mascota: 'Coco', servicio: 'Estética', tipo: 'estetica', estado: 'pendiente' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mi Agenda</h2>
          <p className="text-slate-500 font-medium">Gestión de citas y recursos para hoy</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <Button variant="ghost" size="icon" className="rounded-xl"><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-bold text-slate-700 px-4">Marzo 2026</span>
          <Button variant="ghost" size="icon" className="rounded-xl"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA 1 Y 2: AGENDA DETALLADA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Próximas Atenciones
              </h3>
              <span className="text-xs font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">Hoy</span>
            </div>
            <div className="divide-y divide-slate-50">
              {agendaHoy.map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-slate-400 w-20">{item.hora}</span>
                    <div className={`p-3 rounded-2xl ${
                      item.tipo === 'cirugia' ? 'bg-red-50 text-red-600' : 
                      item.tipo === 'estetica' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {item.tipo === 'cirugia' ? <Stethoscope className="w-5 h-5" /> : 
                       item.tipo === 'estetica' ? <Scissors className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.mascota}</h4>
                      <p className="text-sm text-slate-500">{item.servicio}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.estado === 'completado' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Realizada
                      </span>
                    ) : (
                      <Button size="sm" className="rounded-xl bg-slate-900 text-xs px-4">Iniciar Consulta</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA 3: RECORDATORIOS AUTOMÁTICOS (PUNTO 2 Y 3) */}
        <div className="space-y-6">
          {/* Recordatorios de Vacunación */}
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-blue-200" />
              <h3 className="font-bold text-xl">Alertas de Vacunación</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <p className="text-xs font-bold text-blue-200 uppercase">Vence Mañana</p>
                <p className="font-bold">Luna - Refuerzo Quíntuple</p>
                <p className="text-xs mt-1 text-blue-100">El dueño ya recibió notificación por WhatsApp.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <p className="text-xs font-bold text-blue-200 uppercase">En 3 días</p>
                <p className="font-bold">Rocky - Desparasitación</p>
              </div>
            </div>
          </div>

          {/* Estado de Recursos (Quirófano) */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Estado de Quirófano
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-slate-700">Sala de Cirugía 1</p>
                <p className="text-xs text-green-600 font-medium">Disponible desde las 01:00 PM</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}