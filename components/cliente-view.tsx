'use client'

import { useEffect, useState } from 'react'
import { Cartilla_Vacunacion, Mascotas, Vacuna_desparacitacion } from '@/lib/types'
import { 
  Plus, 
  PawPrint,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Calendar,
  Clock,
  Shield,
  Syringe,
  Pill,
  FileHeart,
  Weight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ClienteViewProps {
  mascotas: Mascotas[]
  cartillas: Cartilla_Vacunacion[]
  tratamientos: Vacuna_desparacitacion[]
  clientId: number | null
  userName: string
  onAgregarMascota: (mascota: Omit<Mascotas, 'id'>) => void
}

export function ClienteView({
  mascotas,
  cartillas,
  tratamientos,
  clientId,
  userName,
  onAgregarMascota,
}: ClienteViewProps) {
  const [isMascotaDialogOpen, setIsMascotaDialogOpen] = useState(false)
  const [isCartillaDialogOpen, setIsCartillaDialogOpen] = useState(false)
  const visibleMascotas = clientId
    ? mascotas.filter((mascota) => mascota.fk_cliente === clientId)
    : mascotas
  const [selectedMascotaId, setSelectedMascotaId] = useState<number | null>(visibleMascotas[0]?.id ?? null)

  useEffect(() => {
    if (!visibleMascotas.length) {
      setSelectedMascotaId(null)
      return
    }

    setSelectedMascotaId((currentId) => {
      if (currentId && visibleMascotas.some((mascota) => mascota.id === currentId)) {
        return currentId
      }

      return visibleMascotas[0].id
    })
  }, [visibleMascotas])
  
  // Form state usando nombres del diagrama UML para Mascotas
  const [mascotaForm, setMascotaForm] = useState({
    Nombre: '',
    Especie: '',
    Raza: '',
    Fecha_Nacimiento: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const especiesOptions = [
    { value: 'Canino', label: 'Canino', icon: Dog },
    { value: 'Felino', label: 'Felino', icon: Cat },
    { value: 'Ave', label: 'Ave', icon: Bird },
    { value: 'Roedor', label: 'Roedor', icon: Rabbit },
  ]

  const razasPorEspecie: Record<string, string[]> = {
    'Canino': ['Golden Retriever', 'Labrador', 'Bulldog Frances', 'Pastor Aleman', 'Chihuahua', 'Poodle', 'Husky', 'Beagle', 'Otro'],
    'Felino': ['Persa', 'Siames', 'Maine Coon', 'Britanico', 'Bengal', 'Ragdoll', 'Mestizo', 'Otro'],
    'Ave': ['Canario', 'Periquito', 'Cockatiel', 'Loro', 'Otro'],
    'Roedor': ['Hamster', 'Cobayo', 'Conejo', 'Chinchilla', 'Otro'],
  }

  const getSpeciesIcon = (Especie: string) => {
    switch(Especie.toLowerCase()) {
      case 'canino':
        return Dog
      case 'felino':
        return Cat
      case 'ave':
        return Bird
      case 'roedor':
        return Rabbit
      default:
        return PawPrint
    }
  }

  const getSpeciesColor = (Especie: string) => {
    switch(Especie.toLowerCase()) {
      case 'canino':
        return 'bg-amber-100 text-amber-700'
      case 'felino':
        return 'bg-violet-100 text-violet-700'
      case 'ave':
        return 'bg-sky-100 text-sky-700'
      case 'roedor':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-primary/10 text-primary'
    }
  }

  const selectedMascota = visibleMascotas.find((mascota) => mascota.id === selectedMascotaId) ?? null
  const selectedMascotaCartillas = cartillas
    .filter((cartilla) => cartilla.fk_mascota === selectedMascotaId)
    .map((cartilla) => {
      const tratamiento = tratamientos.find(
        (vacuna) => vacuna.id_tratamiento === cartilla.fk_tratamiento
      )

      return {
        ...cartilla,
        tratamiento,
      }
    })
    .sort((a, b) => String(b.fecha_atencion).localeCompare(String(a.fecha_atencion)))

  const getTreatmentStyles = (tipo?: string) => {
    if ((tipo || '').toLowerCase().includes('desparas')) {
      return {
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Pill,
        card: 'from-amber-50 to-white',
      }
    }

    return {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: Syringe,
      card: 'from-emerald-50 to-white',
    }
  }

  const openMascotaDialog = () => {
    setMascotaForm({
      Nombre: '',
      Especie: '',
      Raza: '',
      Fecha_Nacimiento: ''
    })
    setFormErrors({})
    setIsMascotaDialogOpen(true)
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!mascotaForm.Nombre.trim()) {
      errors.Nombre = 'El nombre es requerido'
    }
    if (!mascotaForm.Especie) {
      errors.Especie = 'La especie es requerida'
    }
    if (!mascotaForm.Raza) {
      errors.Raza = 'La raza es requerida'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Metodo agregar_mascotas() segun diagrama UML de la clase Cliente
  const agregar_mascotas = () => {
    if (validateForm()) {
      onAgregarMascota({
        Nombre: mascotaForm.Nombre,
        Especie: mascotaForm.Especie,
        Raza: mascotaForm.Raza,
        Fecha_Nacimiento: mascotaForm.Fecha_Nacimiento || '',
        fk_cliente: clientId || 1
      })
      setIsMascotaDialogOpen(false)
      setMascotaForm({
        Nombre: '',
        Especie: '',
        Raza: '',
        Fecha_Nacimiento: ''
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Mascotas</h1>
          <p className="text-muted-foreground">Hola {userName}, gestiona la informacion de tus mascotas</p>
        </div>
        <Button className="gap-2" onClick={openMascotaDialog}>
          <Plus className="w-4 h-4" />
          Agregar Mascota
        </Button>
      </div>

      {/* Stats Cards - Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <PawPrint className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Mascotas</p>
              <p className="text-2xl font-bold">{visibleMascotas.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-accent/10">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Citas Pendientes</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-xl bg-green-100">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proxima Cita</p>
              <p className="text-2xl font-bold">15 Mar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mascotas Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tus Mascotas</h2>
          <Badge variant="secondary">{visibleMascotas.length} registradas</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleMascotas.map((mascota) => {
            const Icon = getSpeciesIcon(mascota.Especie)
            const colorClass = getSpeciesColor(mascota.Especie)
            
            return (
              <Card 
                key={mascota.id} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Card Header with gradient */}
                <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 relative">
                  <div className="absolute -bottom-8 left-6">
                    <div className={`w-16 h-16 rounded-2xl ${colorClass} flex items-center justify-center shadow-lg border-4 border-card`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                <CardHeader className="pt-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{mascota.Nombre}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {mascota.Especie}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Pet Details - Usando nombres exactos del diagrama UML */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nombre</span>
                      <span className="font-medium">{mascota.Nombre}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Especie</span>
                      <span className="font-medium">{mascota.Especie}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Raza</span>
                      <span className="font-medium">{mascota.Raza}</span>
                    </div>
                    {mascota.Fecha_Nacimiento && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Fecha Nacimiento</span>
                        <span className="font-medium">{mascota.Fecha_Nacimiento}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Add Pet Card */}
          <Card 
            className="border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group flex items-center justify-center min-h-[300px]"
            onClick={openMascotaDialog}
          >
            <CardContent className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Agregar Mascota
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-background to-accent/5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Cartilla de Vacunación y Desparasitación
              </CardTitle>
              <CardDescription>
                Consulta lo que ya se le ha aplicado a tu mascota y revisa su historial clínico.
              </CardDescription>
            </div>
            <Button onClick={() => setIsCartillaDialogOpen(true)} className="gap-2">
              <FileHeart className="w-4 h-4" />
              Ver cartilla
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {visibleMascotas.map((mascota) => {
              const Icon = getSpeciesIcon(mascota.Especie)
              const isActive = mascota.id === selectedMascotaId

              return (
                <Button
                  key={mascota.id}
                  variant={isActive ? 'default' : 'outline'}
                  className="h-auto rounded-2xl px-4 py-3"
                  onClick={() => {
                    setSelectedMascotaId(mascota.id)
                    setIsCartillaDialogOpen(true)
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${getSpeciesColor(mascota.Especie)}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-left">
                      <span className="block font-semibold">{mascota.Nombre}</span>
                      <span className="block text-xs opacity-80">{mascota.Especie}</span>
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
            {selectedMascota ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{selectedMascota.Nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMascotaCartillas.length} registro(s) clínicos encontrados
                  </p>
                </div>
                <Badge variant="secondary">
                  Último evento:{' '}
                  {selectedMascotaCartillas[0]?.fecha_atencion || 'Sin registros'}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay mascotas registradas todavía.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mascota Dialog - agregar_mascotas() */}
      <Dialog open={isMascotaDialogOpen} onOpenChange={setIsMascotaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Agregar Mascota
            </DialogTitle>
            <DialogDescription>
              Registra una nueva mascota en tu cuenta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input 
                id="nombre"
                placeholder="Nombre de tu mascota"
                value={mascotaForm.Nombre}
                onChange={(e) => setMascotaForm({...mascotaForm, Nombre: e.target.value})}
                className={formErrors.Nombre ? 'border-destructive' : ''}
              />
              {formErrors.Nombre && (
                <p className="text-xs text-destructive">{formErrors.Nombre}</p>
              )}
            </div>

            {/* Especie */}
            <div className="space-y-2">
              <Label htmlFor="especie">Especie *</Label>
              <Select 
                value={mascotaForm.Especie} 
                onValueChange={(value) => setMascotaForm({...mascotaForm, Especie: value, Raza: ''})}
              >
                <SelectTrigger className={formErrors.Especie ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecciona la especie" />
                </SelectTrigger>
                <SelectContent>
                  {especiesOptions.map((especie) => (
                    <SelectItem key={especie.value} value={especie.value}>
                      <div className="flex items-center gap-2">
                        <especie.icon className="w-4 h-4" />
                        {especie.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.Especie && (
                <p className="text-xs text-destructive">{formErrors.Especie}</p>
              )}
            </div>

            {/* Raza */}
            <div className="space-y-2">
              <Label htmlFor="raza">Raza *</Label>
              <Select 
                value={mascotaForm.Raza} 
                onValueChange={(value) => setMascotaForm({...mascotaForm, Raza: value})}
                disabled={!mascotaForm.Especie}
              >
                <SelectTrigger className={formErrors.Raza ? 'border-destructive' : ''}>
                  <SelectValue placeholder={mascotaForm.Especie ? "Selecciona la raza" : "Primero selecciona la especie"} />
                </SelectTrigger>
                <SelectContent>
                  {mascotaForm.Especie && razasPorEspecie[mascotaForm.Especie]?.map((raza) => (
                    <SelectItem key={raza} value={raza}>
                      {raza}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.Raza && (
                <p className="text-xs text-destructive">{formErrors.Raza}</p>
              )}
            </div>

            {/* Fecha_Nacimiento */}
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento (opcional)</Label>
              <Input 
                id="fecha_nacimiento"
                type="date"
                value={mascotaForm.Fecha_Nacimiento}
                onChange={(e) => setMascotaForm({...mascotaForm, Fecha_Nacimiento: e.target.value})}
              />
            </div>

            {/* Preview */}
            {mascotaForm.Nombre && mascotaForm.Especie && (
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-2">Vista previa</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${getSpeciesColor(mascotaForm.Especie)} flex items-center justify-center`}>
                    {(() => {
                      const Icon = getSpeciesIcon(mascotaForm.Especie)
                      return <Icon className="w-5 h-5" />
                    })()}
                  </div>
                  <div>
                    <p className="font-medium">{mascotaForm.Nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {mascotaForm.Especie}{mascotaForm.Raza && ` - ${mascotaForm.Raza}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMascotaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={agregar_mascotas} className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCartillaDialogOpen} onOpenChange={setIsCartillaDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Cartilla de Vacunación y Desparasitación
            </DialogTitle>
            <DialogDescription>
              Selecciona una mascota para revisar su historial de vacunas y desparasitaciones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              {visibleMascotas.map((mascota) => {
                const Icon = getSpeciesIcon(mascota.Especie)
                const isActive = mascota.id === selectedMascotaId

                return (
                  <button
                    key={mascota.id}
                    type="button"
                    onClick={() => setSelectedMascotaId(mascota.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-background hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${getSpeciesColor(mascota.Especie)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{mascota.Nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {mascota.Especie} · {mascota.Raza}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedMascota ? (
              <div className="rounded-[1.75rem] border bg-card overflow-hidden">
                <div className="border-b bg-gradient-to-r from-primary/10 via-background to-accent/10 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Cartilla de {selectedMascota.Nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedMascota.Especie} · {selectedMascota.Raza}
                        {selectedMascota.Fecha_Nacimiento ? ` · Nació el ${selectedMascota.Fecha_Nacimiento}` : ''}
                      </p>
                    </div>
                    <Badge className="w-fit">
                      {selectedMascotaCartillas.length} aplicación(es) registradas
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  {selectedMascotaCartillas.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
                      <p className="font-medium">Aún no hay aplicaciones registradas.</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Cuando tu mascota reciba una vacuna o desparasitación, aparecerá aquí.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedMascotaCartillas.map((registro) => {
                        const styles = getTreatmentStyles(registro.tratamiento?.nombre)
                        const TreatmentIcon = styles.icon

                        return (
                          <div
                            key={registro.id}
                            className={`rounded-[1.5rem] border bg-gradient-to-r ${styles.card} p-5`}
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="flex items-start gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.badge}`}>
                                  <TreatmentIcon className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-lg font-bold">
                                      {registro.tratamiento?.fk_servicio_veterinario || 'Tratamiento registrado'}
                                    </p>
                                    <Badge variant="outline" className={styles.badge}>
                                      {registro.tratamiento?.fk_medicamento || 'Aplicación'}
                                    </Badge>
                                  </div>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Fecha de aplicación: {String(registro.fecha_atencion)}
                                  </p>
                                </div>
                              </div>

                              <div className="grid gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Weight className="w-4 h-4" />
                                  <span>Peso: {registro.peso} kg</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>Aplicación: {registro.tratamiento?.fecha_aplicacion || String(registro.fecha_atencion)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <div className="rounded-xl bg-white/80 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Diagnóstico / observaciones
                                </p>
                                <p className="mt-2 text-sm">{registro.diagnostico || 'Sin observaciones registradas.'}</p>
                              </div>
                              <div className="rounded-xl bg-white/80 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Receta / indicaciones
                                </p>
                                <p className="mt-2 text-sm">
                                  {registro.receta_medicamento || 'Sin indicaciones adicionales.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
                No hay mascotas registradas todavía.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
