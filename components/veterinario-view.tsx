'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Cartilla_Vacunacion,
  CitaAgendada,
  Mascotas,
  Vacuna_desparacitacion,
  VeterinarioAgenda,
} from '@/lib/types'
import { 
  Plus, 
  Pencil, 
  FileText, 
  Calendar,
  Weight,
  Stethoscope,
  Pill,
  Search,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface VeterinarioViewProps {
  cartillas: Cartilla_Vacunacion[]
  mascotas: Mascotas[]
  tratamientos: Vacuna_desparacitacion[]
  currentVeterinarioId: number | null
  citasAgendadas: CitaAgendada[]
  agendaVeterinarios: VeterinarioAgenda[]
  onCreateCartilla: (cartilla: Omit<Cartilla_Vacunacion, 'id'>) => void
  onUpdateCartilla: (cartilla: Cartilla_Vacunacion) => void
}

export function VeterinarioView({ 
  cartillas, 
  mascotas,
  tratamientos,
  currentVeterinarioId,
  citasAgendadas,
  agendaVeterinarios,
  onCreateCartilla, 
  onUpdateCartilla 
}: VeterinarioViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCartilla, setSelectedCartilla] = useState<Cartilla_Vacunacion | null>(null)
  // Form state - usando nombres exactos del diagrama UML
  const [formData, setFormData] = useState({
    fk_mascota: 1,
    fecha_atencion: new Date().toISOString().split('T')[0],
    peso: 0,
    diagnostico: '',
    receta_medicamento: '',
    fk_tratamiento: 0,
    tratamiento: ''
  })

  const getLocalDateText = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const todayText = getLocalDateText(new Date())
  const citasDeHoy = citasAgendadas.filter((cita) => cita.fecha === todayText)
  const agendaDelVeterinario = currentVeterinarioId
    ? agendaVeterinarios.filter((item) => item.fk_veterinario === currentVeterinarioId)
    : []

  const getMascotaNombre = (fk_mascota: number) => {
    return mascotas.find(m => m.id === fk_mascota)?.Nombre || 'Desconocido'
  }

  const getTratamientoNombre = (fk_tratamiento: number) => {
    const tratamiento = tratamientos.find(
      (t: Vacuna_desparacitacion) => (t.id_tratamiento ?? t.pk_tratamiento) === fk_tratamiento
    )
    return tratamiento
      ? tratamiento.nombre || `Tratamiento #${tratamiento.id_tratamiento ?? tratamiento.pk_tratamiento}`
      : 'Desconocido'
  }

  const filteredCartillas = cartillas.filter(c => {
    const mascotaNombre = getMascotaNombre(c.fk_mascota).toLowerCase()
    return mascotaNombre.includes(searchTerm.toLowerCase()) || 
           c.diagnostico.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Método crear_cartilla() según diagrama UML
  const crear_cartilla = () => {
    if (!currentVeterinarioId) {
      toast.error('No se encontró el veterinario autenticado.')
      return
    }

    onCreateCartilla({
      ...formData,
      fk_veterinario: currentVeterinarioId,
    })
    setIsCreateDialogOpen(false)
    resetForm()
  }

  // Método actualizar_Cartilla() según diagrama UML
  const actualizar_Cartilla = () => {
    if (selectedCartilla) {
      onUpdateCartilla({
        ...selectedCartilla,
        ...formData
      })
      setIsEditDialogOpen(false)
      setSelectedCartilla(null)
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      fk_mascota: 1,
      fecha_atencion: new Date().toISOString().split('T')[0],
      peso: 0,
      diagnostico: '',
      receta_medicamento: '',
      fk_tratamiento: 0,
      tratamiento: ''
    })
  }

  const openEditDialog = (cartilla: Cartilla_Vacunacion) => {
    setSelectedCartilla(cartilla)
    setFormData({
      fk_mascota: cartilla.fk_mascota,
      fecha_atencion: cartilla.fecha_atencion,
      peso: cartilla.peso,
      diagnostico: cartilla.diagnostico,
      receta_medicamento: cartilla.receta_medicamento,
      fk_tratamiento: cartilla.fk_tratamiento,
      tratamiento: cartilla.tratamiento
    })
    setIsEditDialogOpen(true)
  }
    {/*sECCIÓN EN LA CUAL SE MANDA EL WAHTSAPP */}
  const abrirWhatsapp = (telefono: string, veterinario: string, fecha: string, hora: string) => {
    const mensaje = encodeURIComponent(`Te recordamos que tienes una cita con el Veterinario ${veterinario} el día ${fecha} a las ${hora}. ¡No olvides llevar a tu mascota!`)
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel Veterinario</h1>
          <p className="text-muted-foreground">Gestiona las cartillas de vacunacion de los pacientes</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Crear Cartilla
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cartillas.length}</p>
                <p className="text-sm text-muted-foreground">Total Cartillas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{citasDeHoy.length}</p>
                <p className="text-sm text-muted-foreground">Citas Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary">
                <Stethoscope className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{agendaDelVeterinario.length}</p>
                <p className="text-sm text-muted-foreground">Horarios en Agenda</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Pill className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cartillas.filter((cartilla) => cartilla.receta_medicamento.trim()).length}
                </p>
                <p className="text-sm text-muted-foreground">Recetas Emitidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Citas de hoy</CardTitle>
            <CardDescription>Las citas asignadas al veterinario autenticado para el día de hoy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {citasDeHoy.length === 0 ? (
              <div className="rounded-xl border border-dashed border-muted-foreground/20 bg-muted/30 p-4 text-sm text-muted-foreground">
                No hay citas agendadas para hoy.
              </div>
            ) : (
              citasDeHoy.map((cita) => (
                <div key={cita.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{cita.servicio}</p>
                      <p className="text-sm text-muted-foreground">{cita.mascota}</p>
                    </div>
                    <Badge variant="outline">{cita.hora}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{cita.motivo}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda del veterinario</CardTitle>
            <CardDescription>Horarios cargados desde la tabla `Agenda_Veterinario`.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {agendaDelVeterinario.length === 0 ? (
              <div className="rounded-xl border border-dashed border-muted-foreground/20 bg-muted/30 p-4 text-sm text-muted-foreground">
                No hay agenda registrada para este veterinario.
              </div>
            ) : (
              agendaDelVeterinario.map((slot) => (
                <div key={`${slot.fk_veterinario}-${slot.dia}-${slot.hora_inicio}-${slot.hora_fin}`} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{slot.dia}</p>
                      <p className="text-sm text-muted-foreground">
                        {slot.hora_inicio} - {slot.hora_fin}
                      </p>
                    </div>
                    <Badge variant={slot.disponible ? 'default' : 'secondary'}>
                      {slot.disponible ? 'Disponible' : 'No disponible'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cartilla_Vacunacion Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Cartillas de Vacunacion
              </CardTitle>
              <CardDescription>Registro completo de atenciones medicas</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Mascota</TableHead>
                  <TableHead>fecha de atencion</TableHead>
                  <TableHead>peso</TableHead>
                  <TableHead className="max-w-xs">diagnostico</TableHead>
                  <TableHead className="max-w-xs">receta</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCartillas.map((cartilla) => (
                  <TableRow key={cartilla.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {getMascotaNombre(cartilla.fk_mascota).charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{getMascotaNombre(cartilla.fk_mascota)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cartilla.fecha_atencion}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Weight className="w-3 h-3 text-muted-foreground" />
                        {cartilla.peso} kg
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm">{cartilla.diagnostico}</p>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm text-muted-foreground">{cartilla.receta_medicamento}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => openEditDialog(cartilla)}
                      >
                        <Pencil className="w-3 h-3" />
                        actualizar Cartilla
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog - crear_cartilla() */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Cartilla Medica</DialogTitle>
            <DialogDescription>
              Registra una nueva atención medica para un paciente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mascota">Mascota</Label>
                <select 
                  id="mascota"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.fk_mascota}
                  onChange={(e) => setFormData({...formData, fk_mascota: Number(e.target.value)})}
                >
                  {mascotas.map(m => (
                    <option key={m.id} value={m.id}>{m.Nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha de Atencion</Label>
                <Input 
                  id="fecha"
                  type="date" 
                  value={formData.fecha_atencion}
                  onChange={(e) => setFormData({...formData, fecha_atencion: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input 
                id="peso"
                type="number" 
                step="0.1"
                placeholder="0.0"
                value={formData.peso || ''}
                onChange={(e) => setFormData({...formData, peso: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnostico">Diagnostico</Label>
              <Textarea 
                id="diagnostico"
                placeholder="Ingresa el diagnostico del paciente..."
                value={formData.diagnostico}
                onChange={(e) => setFormData({...formData, diagnostico: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receta">Receta</Label>
              <Textarea 
                id="receta"
                placeholder="Detalla la receta medica..."
                value={formData.receta_medicamento}
                onChange={(e) => setFormData({...formData, receta_medicamento: e.target.value})}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="receta">Tipo de tratamiento</Label>
              <h3>Registrar médicamentos administrados en la consulta</h3>
              <select
                id="tratamiento"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.tratamiento}
                onChange={(e) => setFormData({...formData, tratamiento: e.target.value}) }>
                <option value="">Selecciona un tratamiento</option>
                {tratamientos.map((t: Vacuna_desparacitacion) => (
                  <option key={t.pk_tratamiento} value={t.nombre || `Tratamiento ${t.id_tratamiento}`}>
                    {t.nombre || `Tratamiento ${t.pk_tratamiento}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={crear_cartilla}>
              Crear Cartilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - actualizar_Cartilla() */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Cartilla de Vacunacion</DialogTitle>
            <DialogDescription>
              Actualiza los datos de la atencion medica
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-mascota">Mascota</Label>
                <select 
                  id="edit-mascota"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.fk_mascota}
                  onChange={(e) => setFormData({...formData, fk_mascota: Number(e.target.value)})}
                >
                  {mascotas.map(m => (
                    <option key={m.id} value={m.id}>{m.Nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-peso">Peso (kg)</Label>
              <Input 
                id="edit-peso"
                type="number" 
                step="0.1"
                value={formData.peso || ''}
                onChange={(e) => setFormData({...formData, peso: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-diagnostico">Diagnostico</Label>
              <Textarea 
                id="edit-diagnostico"
                value={formData.diagnostico}
                onChange={(e) => setFormData({...formData, diagnostico: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-receta">Receta</Label>
              <Textarea 
                id="edit-receta"
                value={formData.receta_medicamento}
                onChange={(e) => setFormData({...formData, receta_medicamento: e.target.value})}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="edit-tratamiento">Tratamiento</Label>
              <select
                id="edit-tratamiento"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.tratamiento}
                onChange={(e) => setFormData({...formData, tratamiento: e.target.value}) }>
                <option value="">Selecciona un tratamiento</option>
                {tratamientos.map((t: Vacuna_desparacitacion) => (
                  <option key={t.pk_tratamiento} value={t.nombre || `Tratamiento ${t.id_tratamiento}`}>
                    {t.nombre || `Tratamiento ${t.pk_tratamiento}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={actualizar_Cartilla}>
              Actualizar Cartilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
