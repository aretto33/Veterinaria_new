'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Mascotas, Servicios, VeterinarioServicio, VeterinarioAgenda } from '@/lib/types'

interface AdminVeterinarioServicioViewProps {
  servicios: Servicios[]
  veterinarioServicios: VeterinarioServicio[]
  agendaVeterinarios: VeterinarioAgenda[]
  canCreate?: boolean
  onCreateVeterinarioServicio: (item: Omit<VeterinarioServicio, 'fk_veterinario' | 'fk_servicio'> & { fk_veterinario: number; fk_servicio: number }) => void
  onUpdateVeterinarioServicio: (item: VeterinarioServicio) => void
  onDeleteVeterinarioServicio: (item: { fk_veterinario: number; fk_servicio: number}) => void
}

export function AdminVeterinarioServicioView({
  servicios,
  veterinarioServicios,
  agendaVeterinarios,
  canCreate = false,
  onCreateVeterinarioServicio,
  onUpdateVeterinarioServicio,
  onDeleteVeterinarioServicio,
}: AdminVeterinarioServicioViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selected, setSelected] = useState<VeterinarioServicio | null>(null)
  const [formState, setFormState] = useState({ veterinario_nombre: '', fk_veterinario: 0, fk_servicio: 0, precio: 0, especialidad: '', telefono: '', direccion: '' })

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return veterinarioServicios.filter(vs =>
      vs.veterinario_nombre.toLowerCase().includes(term) ||
      vs.especialidad.toLowerCase().includes(term) ||
      servicios.find(s => s.id_servicio === vs.fk_servicio)?.nombre.toLowerCase().includes(term)
    )
  }, [searchTerm, veterinarioServicios, servicios])

  const openEdit = (item: VeterinarioServicio) => {
    setSelected(item)
    setFormState({
      ...item,
    })
    setIsEditDialogOpen(true)
  }

  const openDelete = (item: VeterinarioServicio) => {
    setSelected(item)
    setIsDeleteDialogOpen(true)
  }

  const handleCreate = () => {
    if (!canCreate) return
    if (!formState.fk_veterinario || !formState.fk_servicio) return
    onCreateVeterinarioServicio(formState as any)
    setIsCreateDialogOpen(false)
    setFormState({ veterinario_nombre: '', fk_veterinario: 0, fk_servicio: 0, precio: 0, especialidad: '', telefono: '', direccion: '' })
  }

  const handleUpdate = () => {
    if (selected) {
      onUpdateVeterinarioServicio({ ...selected, ...formState })
      setIsEditDialogOpen(false)
      setSelected(null)
    }
  }

  const handleDelete = () => {
    if (selected) {
      onDeleteVeterinarioServicio({ fk_veterinario: selected.fk_veterinario, fk_servicio: selected.fk_servicio })
      setIsDeleteDialogOpen(false)
      setSelected(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Servicios Veterinario</h1>
          <p className="text-muted-foreground">Administra los servicios que ofrece cada veterinario</p>
        </div>
        {canCreate ? (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo
          </Button>
        ) : (
          <Button variant="outline" disabled className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo (solo admin)
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar veterinario, servicio, especialidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veterinario</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={`${item.fk_veterinario}-${item.fk_servicio}`}>
                  <TableCell>{item.veterinario_nombre}</TableCell>
                  <TableCell>{servicios.find(s => s.id_servicio === item.fk_servicio)?.nombre || '—'}</TableCell>
                  <TableCell>{item.especialidad}</TableCell>
                  <TableCell>${item.precio.toFixed(2)}</TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDelete(item)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nuevo servicio veterinario</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Id Veterinario</Label>
              <Input type="number" value={formState.fk_veterinario} onChange={(e) => setFormState(prev => ({ ...prev, fk_veterinario: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Id Servicio</Label>
              <Input type="number" value={formState.fk_servicio} onChange={(e) => setFormState(prev => ({ ...prev, fk_servicio: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input type="number" value={formState.precio} onChange={(e) => setFormState(prev => ({ ...prev, precio: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar servicio veterinario</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input type="number" value={formState.precio} onChange={(e) => setFormState(prev => ({ ...prev, precio: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Eliminar asignación</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>Confirmar eliminación del servicio veterinario.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}