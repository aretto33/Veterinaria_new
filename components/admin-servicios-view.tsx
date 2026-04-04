'use client'

import { useState } from 'react'
import { Servicios } from '@/lib/types'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Wrench,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AdminServiciosViewProps {
  servicios: Servicios[]
  onCreateServicio: (servicio: Omit<Servicios, 'id_servicio'>) => void
  onUpdateServicio: (servicio: Servicios) => void
  onDeleteServicio: (id: number) => void
}

export function AdminServiciosView({
  servicios,
  onCreateServicio,
  onUpdateServicio,
  onDeleteServicio,
}: AdminServiciosViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedServicio, setSelectedServicio] = useState<Servicios | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripción: '',
    precio: 0,
  })

  const filteredServicios = servicios.filter(servicio =>
    servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.descripción.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripción: '',
      precio: 0,
    })
  }

  const handleCreate = () => {
    onCreateServicio(formData)
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleUpdate = () => {
    if (selectedServicio) {
      onUpdateServicio({ ...selectedServicio, ...formData })
      setIsEditDialogOpen(false)
      setSelectedServicio(null)
      resetForm()
    }
  }

  const handleDelete = () => {
    if (selectedServicio) {
      onDeleteServicio(selectedServicio.id_servicio)
      setIsDeleteDialogOpen(false)
      setSelectedServicio(null)
    }
  }

  const openEditDialog = (servicio: Servicios) => {
    setSelectedServicio(servicio)
    setFormData({
      nombre: servicio.nombre,
      descripción: servicio.descripción,
      precio: servicio.precio,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (servicio: Servicios) => {
    setSelectedServicio(servicio)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administrar Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios veterinarios disponibles</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{servicios.length}</p>
                <p className="text-sm text-muted-foreground">Total Servicios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ${servicios.reduce((sum, s) => sum + s.precio, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Valor Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredServicios.length}</p>
                <p className="text-sm text-muted-foreground">Servicios Filtrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servicios Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Lista de Servicios
              </CardTitle>
              <CardDescription>Gestiona todos los servicios veterinarios</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar servicios..."
                className="pl-9 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Servicio</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServicios.map((servicio) => (
                  <TableRow key={servicio.id_servicio} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="font-medium">{servicio.nombre}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm text-muted-foreground">
                        {servicio.descripción}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        ${servicio.precio.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(servicio)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(servicio)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Servicio</DialogTitle>
            <DialogDescription>
              Agrega un nuevo servicio veterinario al sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-nombre">Nombre del Servicio</Label>
              <Input
                id="create-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Consulta General"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-descripcion">Descripción</Label>
              <Textarea
                id="create-descripcion"
                value={formData.descripción}
                onChange={(e) => setFormData({...formData, descripción: e.target.value})}
                placeholder="Describe el servicio..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-precio">Precio ($)</Label>
              <Input
                id="create-precio"
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Crear Servicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Servicio</DialogTitle>
            <DialogDescription>
              Modifica la información del servicio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre del Servicio</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={formData.descripción}
                onChange={(e) => setFormData({...formData, descripción: e.target.value})}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-precio">Precio ($)</Label>
              <Input
                id="edit-precio"
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El servicio "{selectedServicio?.nombre}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}