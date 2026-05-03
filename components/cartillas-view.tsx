'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ChevronRight,
  Download,
  FileText,
  Filter,
  History,
  Printer,
  Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Cartilla_Vacunacion, Mascotas } from '@/lib/types'
import { toast } from 'sonner'

// Tipado extendido para flexibilidad de la base de datos
type MascotaDocumento = Mascotas & {
  pk_mascotas?: number
}

// Helpers de formato
const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha'

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) 
    ? String(value) 
    : parsed.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

const normalizeText = (value?: string) => (value || '').toLowerCase().trim()

const sortByFechaDesc = (a: Cartilla_Vacunacion, b: Cartilla_Vacunacion) =>
  String(b.fecha_atencion).localeCompare(String(a.fecha_atencion))

export function CartillasView({
  cartillas,
  mascotas,
}: {
  cartillas: Cartilla_Vacunacion[]
  mascotas: MascotaDocumento[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMascotaId, setSelectedMascotaId] = useState<number | null>(null)

  // 1. Agrupación y Filtrado Lógico
  const groupedByMascota = useMemo(() => {
    const term = normalizeText(searchTerm)

    return mascotas
      .map((mascota) => {
        const historial = cartillas
          .filter((cartilla) => cartilla.fk_mascota === mascota.id)
          .sort(sortByFechaDesc)

        return {
          mascota,
          historial,
          latestRecord: historial[0] ?? null,
        }
      })
      .filter(({ mascota, historial, latestRecord }) => {
        // Solo mostrar mascotas que tengan al menos un registro médico
        if (historial.length === 0) return false

        if (!term) return true

        return (
          normalizeText(mascota.Nombre).includes(term) ||
          normalizeText(mascota.Especie).includes(term) ||
          normalizeText(mascota.Raza).includes(term) ||
          historial.some((c) => String(c.id).includes(term)) ||
          normalizeText(latestRecord?.diagnostico).includes(term)
        )
      })
      .sort((a, b) => {
        if (!a.latestRecord || !b.latestRecord) return 0
        return sortByFechaDesc(a.latestRecord, b.latestRecord)
      })
  }, [cartillas, mascotas, searchTerm])

  // 2. Control de selección automática
  useEffect(() => {
    if (groupedByMascota.length === 0) {
      setSelectedMascotaId(null)
      return
    }
    const exists = groupedByMascota.some((item) => item.mascota.id === selectedMascotaId)
    if (!exists) {
      setSelectedMascotaId(groupedByMascota[0].mascota.id)
    }
  }, [groupedByMascota, selectedMascotaId])

  const selectedGroup = groupedByMascota.find((item) => item.mascota.id === selectedMascotaId) ?? null

  // 3. Manejo de PDF
  const handleExport = () => {
    if (!selectedGroup) {
      toast.error('Selecciona una mascota para exportar.')
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      toast.error('Error de configuración: API URL no encontrada.')
      return
    }

    const idMascota = selectedGroup.mascota.pk_mascotas ?? selectedGroup.mascota.id
    
    toast.info('Generando reporte médico...', {
      description: 'El documento se abrirá en una nueva pestaña.',
    })

    window.open(
      `${apiUrl}/pdf_historial?pk_mascota=${encodeURIComponent(String(idMascota))}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-8 animate-in fade-in duration-700">
      {/* Header y Buscador */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Gestión Documental</h2>
          <p className="text-slate-500">Expedientes históricos y reportes oficiales de MediVet</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por mascota, especie o folio..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 sm:w-72 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sidebar: Lista de Mascotas */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Mascotas con expediente</p>
            <p className="mt-1 text-xs text-slate-500 uppercase tracking-wider">
              {groupedByMascota.length} resultados encontrados
            </p>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {groupedByMascota.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm">No se encontraron coincidencias.</p>
              </div>
            ) : (
              groupedByMascota.map(({ mascota, historial, latestRecord }) => {
                const isActive = mascota.id === selectedMascotaId
                return (
                  <button
                    key={mascota.id}
                    onClick={() => setSelectedMascotaId(mascota.id)}
                    className={`group w-full rounded-[1.5rem] border p-5 text-left transition-all ${
                      isActive
                        ? 'scale-[1.02] border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-4">
                        <div className={`rounded-xl p-3 transition-colors ${
                          isActive ? 'bg-white/20' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold leading-tight">{mascota.Nombre}</h4>
                          <p className={`mt-0.5 text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                            {mascota.Especie} • {mascota.Raza}
                          </p>
                          <p className={`mt-2 text-[10px] font-medium uppercase tracking-tighter ${
                            isActive ? 'text-blue-200' : 'text-slate-400'
                          }`}>
                            Último: {formatDate(latestRecord?.fecha_atencion)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`} />
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Main: Visualización del Expediente */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <div className="sticky top-8 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl animate-in slide-in-from-right-4 duration-500">
              {/* Header del Expediente */}
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50 p-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-inner">
                    <Activity className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Historial Clínico</h3>
                    <p className="text-sm font-medium text-slate-500">
                      Mostrando {selectedGroup.historial.length} registro(s) de <span className="text-blue-600 font-bold">{selectedGroup.mascota.Nombre}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleExport} variant="outline" className="rounded-xl border-slate-200 hover:bg-white">
                    <Printer className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button onClick={handleExport} className="rounded-xl bg-slate-900 px-6 text-white shadow-lg hover:bg-blue-700 transition-colors">
                    <Download className="mr-2 h-4 w-4" /> Exportar PDF
                  </Button>
                </div>
              </div>

              <div className="space-y-8 p-8">
                {/* Cards de Información Rápida */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Paciente</h4>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Nombre: <span className="font-normal text-slate-500">{selectedGroup.mascota.Nombre}</span></p>
                      <p className="text-sm font-semibold text-slate-700">Especie: <span className="font-normal text-slate-500">{selectedGroup.mascota.Especie || 'N/A'}</span></p>
                      <p className="text-sm font-semibold text-slate-700">Raza: <span className="font-normal text-slate-500">{selectedGroup.mascota.Raza || 'N/A'}</span></p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Última Revisión</h4>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Peso: <span className="text-green-600 font-bold">{selectedGroup.latestRecord?.peso ?? '--'} kg</span></p>
                      <p className="text-sm font-semibold text-slate-700 line-clamp-1">Diagnóstico: <span className="font-normal text-slate-500">{selectedGroup.latestRecord?.diagnostico || 'Consulta general'}</span></p>
                      <p className="text-sm font-semibold text-slate-700">Fecha: <span className="font-normal text-slate-500">{formatDate(selectedGroup.latestRecord?.fecha_atencion)}</span></p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                  <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                    <History className="h-4 w-4" /> Línea de Tiempo Médica
                  </h4>
                  <div className="ml-3 space-y-8 border-l-2 border-dashed border-slate-200 pl-8">
                    {selectedGroup.historial.map((registro) => (
                      <div key={registro.id} className="relative">
                        <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-md"></div>
                        <div className="group rounded-2xl border border-transparent p-4 transition-all hover:bg-slate-50 hover:border-slate-100">
                          <p className="text-xs font-bold text-blue-500 uppercase tracking-tighter">
                            {formatDate(registro.fecha_atencion)}
                          </p>
                          <h5 className="mt-1 text-base font-bold text-slate-800">
                            {registro.diagnostico || 'Atención Médica'}
                          </h5>
                          <div className="mt-3 flex flex-wrap gap-4">
                            <div className="text-xs bg-white border px-2 py-1 rounded-md text-slate-500">
                              <span className="font-bold text-slate-700">Receta:</span> {registro.receta_medicamento || 'Sin medicamentos'}
                            </div>
                            <div className="text-xs bg-white border px-2 py-1 rounded-md text-slate-500">
                              <span className="font-bold text-slate-700">Peso:</span> {registro.peso ?? '--'} kg
                            </div>
                            <div className="text-xs bg-white border px-2 py-1 rounded-md text-blue-600">
                              <span className="font-bold">ID:</span> #{registro.id}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[60vh] flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/50 text-slate-400">
              <div className="rounded-full bg-slate-100 p-6">
                <FileText className="h-12 w-12 opacity-20" />
              </div>
              <p className="mt-4 text-lg font-medium">Selecciona un paciente del panel izquierdo</p>
              <p className="text-sm">Podrás visualizar y exportar su historial clínico completo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}