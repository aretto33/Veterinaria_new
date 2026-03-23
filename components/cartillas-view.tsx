'use client'
import { useState } from 'react'
import { FileText, Search, Printer, Download, Filter, History, ChevronRight, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function CartillasView({ cartillas, mascotas }: { cartillas: any[], mascotas: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // 1. Lógica de búsqueda avanzada
  const filteredCartillas = cartillas.filter(c => {
    const mascota = mascotas.find(m => m.id === c.mascota_id)
    return mascota?.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.id.toString().includes(searchTerm)
  })

  const cartillaSeleccionada = cartillas.find(c => c.id === selectedId)
  const mascotaSeleccionada = mascotas.find(m => m.id === cartillaSeleccionada?.mascota_id)

  const handleExport = () => {
    toast.info("Generando reporte médico...", {
      description: "El archivo PDF se descargará en unos segundos."
    })
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión Documental</h2>
          <p className="text-slate-500">Expedientes históricos y reportes oficiales de MediVet</p>
        </div>
        
        {/* 1. Barra de Búsqueda y Filtros */}
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por mascota o folio..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200">
            <Filter className="w-4 h-4 mr-2" /> Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTA DE CARTILLAS */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
  {filteredCartillas.map((c) => {
    const m = mascotas.find(pet => pet.id === c.mascota_id)
    return (
      <div 
        key={c.id}
        onClick={() => setSelectedId(c.id)}
        className={`p-5 rounded-[1.5rem] border transition-all cursor-pointer ${
          selectedId === c.id 
          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.02]' 
          : 'bg-white border-slate-200 text-slate-900 hover:border-blue-300'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className={`p-3 rounded-xl ${selectedId === c.id ? 'bg-white/20' : 'bg-blue-50'}`}>
              <FileText className={`w-5 h-5 ${selectedId === c.id ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <div>
              {/* CAMBIO AQUÍ: El nombre de la mascota ahora es el título principal */}
              <h4 className="font-bold text-lg leading-tight">
                {m?.Nombre || "Mascota desconocida"}
              </h4>
              <p className={`text-xs mt-1 ${selectedId === c.id ? 'text-blue-100' : 'text-slate-400'}`}>
                Folio médico: #{c.id}
              </p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 mt-1 opacity-50 ${selectedId === c.id ? 'text-white' : ''}`} />
        </div>
      </div>
    )
  })}
</div>

        {/* 2. VISTA DE EXPEDIENTE DETALLADO */}
        <div className="lg:col-span-2">
          {selectedId ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden sticky top-8">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Historial Clínico</h3>
                    <p className="text-sm text-slate-500 italic">Actualizado al {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                {/* 3. BOTONES DE EXPORTACIÓN */}
                <div className="flex gap-2">
                  <Button onClick={handleExport} variant="outline" className="rounded-xl hover:bg-white shadow-sm">
                    <Printer className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleExport} className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl shadow-lg px-6">
                    <Download className="w-4 h-4 mr-2" /> Exportar PDF
                  </Button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase font-black text-blue-600 tracking-widest">Información del Paciente</h4>
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                      <p className="text-sm font-medium">Nombre: <span className="text-slate-600">{mascotaSeleccionada?.Nombre}</span></p>
                      <p className="text-sm font-medium">Especie: <span className="text-slate-600">{mascotaSeleccionada?.Especie}</span></p>
                      <p className="text-sm font-medium">Raza: <span className="text-slate-600">{mascotaSeleccionada?.Raza}</span></p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase font-black text-blue-600 tracking-widest">Resumen de Salud</h4>
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                      <p className="text-sm font-medium">Última Vacuna: <span className="text-green-600 font-bold">{cartillaSeleccionada?.Vacunas}</span></p>
                      <p className="text-sm font-medium">Próxima dosis: <span className="text-slate-600">En 6 meses</span></p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-black text-blue-600 tracking-widest flex items-center gap-2">
                    <History className="w-3 h-3" /> Línea de Tiempo Médica
                  </h4>
                  <div className="border-l-2 border-slate-100 ml-2 space-y-6">
                    {[1, 2].map((_, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-500 shadow-sm"></div>
                        <p className="text-xs font-bold text-slate-400">12 NOV 2025</p>
                        <p className="text-sm font-bold text-slate-800">Aplicación de Vacuna {cartillaSeleccionada?.Vacunas}</p>
                        <p className="text-xs text-slate-500">Dosis completada por Dr. Alejandro Martínez</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[60vh] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Selecciona una cartilla para ver el expediente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}