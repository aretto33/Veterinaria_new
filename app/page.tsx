'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  CitaAgendada,
  Cartilla_Vacunacion,
  Mascotas,
  Servicios,
  Usuario,
  Vacuna_desparacitacion,
  VeterinarioAgenda,
  VeterinarioServicio,
} from '@/lib/types'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardView } from '@/components/dashboard-view'
import { LoginView } from '@/components/login-view'
import { VeterinarioView } from '@/components/veterinario-view'
import { ClienteView } from '@/components/cliente-view'
import { CitasView } from '@/components/citas-view'
import { SettingsView } from '@/components/settings-view'
import { CartillasView } from '@/components/cartillas-view'
import { CalendarioView } from '@/components/calendario-view'
import { ListaVeterinariosView } from '@/components/lista-veterinarios-view'
import { AdminServiciosView } from '@/components/admin-servicios-view'
import { AdminVeterinarioServicioView } from '@/components/admin-veterinario-servicio-view'
import { AyudaSection } from '@/components/ayuda-section'
import { Menu, X, ShieldCheck, Smartphone, MessageCircle, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

type View = 'dashboard' | 'login' | 'veterinario' | 'cliente' | 'cartillas' | 'calendario' | 'citas' | 'settings' | 'veterinarios_lista' | 'admin_servicios' | 'admin_veterinario_servicio' | 'ayuda-section'

const mapCitaAgendada = (cita: any): CitaAgendada => {
  const fecha = new Date(cita.fecha_hora)
  const hasValidDate = !Number.isNaN(fecha.getTime())

  return {
    id: Number(cita.id ?? cita.pk_cita ?? 0),
    servicio: cita.servicio,
    mascota: cita.mascota,
    veterinario: cita.veterinario,
    fecha: hasValidDate ? fecha.toISOString().slice(0, 10) : '',
    hora: hasValidDate ? fecha.toTimeString().slice(0, 5) : '',
    direccion: cita.direccion,
    motivo: cita.motivo,
  }
}

const dedupeCitas = (citas: CitaAgendada[]) => {
  const uniqueCitas = new Map<number, CitaAgendada>()

  for (const cita of citas) {
    if (!uniqueCitas.has(cita.id)) {
      uniqueCitas.set(cita.id, cita)
    }
  }

  return Array.from(uniqueCitas.values())
}

export default function MediVetApp() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [servicios, setServicios] = useState<Servicios[]>([])
  const [cartillas, setCartillas] = useState<Cartilla_Vacunacion[]>([])
  const [mascotas, setMascotas] = useState<Mascotas[]>([])
  const [tratamientos, setTratamientos] = useState<Vacuna_desparacitacion[]>([])
  const [veterinarioServicios, setVeterinarioServicios] = useState<VeterinarioServicio[]>([])
  const [agendaVeterinarios, setAgendaVeterinarios] = useState<VeterinarioAgenda[]>([])
  const [citasAgendadas, setCitasAgendadas] = useState<CitaAgendada[]>([])
  const [nombresUsuarios, setNombresUsuarios] = useState<Record<number, string>>({})
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bootstrap`)
        if (!response.ok) {
          throw new Error('No se pudo cargar la informacion inicial')
        }

        const data = await response.json()
        setServicios(
          (data.servicios || []).map((servicio: Servicios & { pk_servicio?: number }) => ({
            ...servicio,
            id_servicio: servicio.id_servicio ?? servicio.pk_servicio ?? 0,
          }))
        )
        setCartillas(data.cartillas)
        setMascotas(data.mascotas)
        setTratamientos(data.tratamientos || [])
        setVeterinarioServicios(data.veterinarioServicios || [])
        setAgendaVeterinarios(data.agendaVeterinarios || [])
        setCitasAgendadas(dedupeCitas((data.citas || []).map(mapCitaAgendada)))
        setNombresUsuarios(data.nombresUsuarios)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo cargar la informacion inicial'
        toast.error(message)
      } finally {
        setIsBootstrapping(false)
      }
    }

    loadInitialData()
  }, [])

  const getNombreCompleto = useCallback(
    (userId?: number | null) => {
      if (!userId) {
        return 'Usuario'
      }

      return nombresUsuarios[userId] || 'Usuario'
    },
    [nombresUsuarios]
  )
  const handleListaVeterinarios = useCallback(() => {
    setCurrentView('veterinarios_lista')
  }, [])
  
  const handleLogin = useCallback((user: Usuario, fullName: string) => {
    setCurrentUser(user)
    setNombresUsuarios((prev) => ({ ...prev, [user.id]: fullName }))
    if (user.role_id === 2) {
      setCurrentView('veterinario')
    } else if (user.role_id === 1) {
      setCurrentView('cliente')
    }
    toast.success(`Bienvenido/a, ${fullName}`)
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setCurrentView('dashboard')
    toast.info('Sesión cerrada correctamente')
  }, [])

  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view as View)
    setSidebarOpen(false)
  }, [])

  const handleCreateCartilla = useCallback(async (cartilla: Omit<Cartilla_Vacunacion, 'id'>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cartillas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartilla),
      })

      if (!response.ok) {
        throw new Error('No se pudo crear la cartilla')
      }

      const newCartilla: Cartilla_Vacunacion = await response.json()
      setCartillas((prev) => [...prev, newCartilla])
      toast.success('Cartilla creada exitosamente')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear la cartilla'
      toast.error(message)
    }
  }, [])

  const handleUpdateCartilla = useCallback(async (updatedCartilla: Cartilla_Vacunacion) => {
    try {
      const { id, ...payload } = updatedCartilla
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cartillas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: 'Error desconocido por el servidor'}))
        throw new Error(`No se pudo actualizar la cartilla: ${errorData.message} || ${response.statusText}`)
      }

      const savedCartilla: Cartilla_Vacunacion = await response.json()
      setCartillas((prev) => prev.map((item) => (item.id === savedCartilla.id ? savedCartilla : item)))
      toast.success('Cartilla actualizada exitosamente')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo actualizar la cartilla' 
      toast.error(message)
    }
  }, [])

  const handleCreateServicio = useCallback(async (servicio: Omit<Servicios, 'id_servicio'>) => {
    try {
      const payload = {
        nombre: servicio.nombre,
        descripcion: servicio.descripción,
        precio: servicio.precio,
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('No se pudo crear el servicio')
      }

      const newServicio: Servicios = await response.json()
      setServicios((prev) => [...prev, newServicio])
      toast.success('Servicio creado exitosamente')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo crear el servicio'
      toast.error(message)
    }
  }, [])

  const handleUpdateServicio = useCallback(async (updatedServicio: Servicios) => {
    try {
      const { id_servicio, ...payload } = updatedServicio
      const normalizedPayload = {
        nombre: payload.nombre,
        descripcion: payload.descripción,
        precio: payload.precio,
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicios/${id_servicio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedPayload),
      })

      if (!response.ok) {
        throw new Error('No se pudo actualizar el servicio')
      }

      const savedServicio: Servicios = await response.json()
      setServicios((prev) => prev.map((item) => (item.id_servicio === savedServicio.id_servicio ? savedServicio : item)))
      toast.success('Servicio actualizado exitosamente')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo actualizar el servicio'
      toast.error(message)
    }
  }, [])

  const handleDeleteServicio = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicios/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('No se pudo eliminar el servicio')
      }

      setServicios((prev) => prev.filter((item) => item.id_servicio !== id))
      toast.success('Servicio eliminado exitosamente')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el servicio'
      toast.error(message)
    }
  }, [])

  const handleCreateVeterinarioServicio = useCallback(async (servicio: Omit<VeterinarioServicio, 'veterinario_nombre' | 'especialidad' | 'telefono' | 'direccion'>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/veterinario_servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servicio),
      })

      if (!response.ok) {
        throw new Error('No se pudo crear el servicio veterinario')
      }

      const created = await response.json()
      setVeterinarioServicios((prev) => [...prev, created])
      toast.success('Servicio veterinario creado')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear servicio veterinario'
      toast.error(message)
    }
  }, [])

  const handleUpdateVeterinarioServicio = useCallback(async (servicio: VeterinarioServicio) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/veterinario_servicio/${servicio.pk_veterinario_servicio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          precio: servicio.precio,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({message: 'Error desconocido por el servidor'}))
        throw new Error(`No se pudo actualizar la servicio: ${errorData.message} || ${response.statusText}`)
        
      }

      const updated = await response.json()
      setVeterinarioServicios((prev) =>
        prev.map((it) =>
          it.pk_veterinario_servicio === updated.pk_veterinario_servicio
            ? { ...it, precio: Number(updated.precio) }
            : it
        )
      )
      toast.success('Servicio veterinario actualizado')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar servicio veterinario'
      toast.error(message)
    }
  }, [])

  const handleDeleteVeterinarioServicio = useCallback(async (payload: { fk_veterinario: number; fk_servicio: number }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/veterinario-servicios/${payload.fk_veterinario}/${payload.fk_servicio}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('No se pudo eliminar el servicio veterinario')
      }

      setVeterinarioServicios((prev) => prev.filter((it) => !(it.fk_veterinario === payload.fk_veterinario && it.fk_servicio === payload.fk_servicio)))
      toast.success('Servicio veterinario eliminado')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar servicio veterinario'
      toast.error(message)
    }
  }, [])

  const handleAgregarMascota = useCallback(async (mascota: Omit<Mascotas, 'id'>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mascotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mascota),
      })

      if (!response.ok) {
        throw new Error('No se pudo registrar la mascota')
      }

      const newMascota: Mascotas = await response.json()
      setMascotas((prev) => [...prev, newMascota])
      toast.success('Mascota registrada exitosamente', {
        description: `${mascota.Nombre} ha sido agregada`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar la mascota'
      toast.error(message)
    }
  }, [])

  const handleAgendarCita = useCallback((cita: Omit<CitaAgendada, 'id'>) => {
    const save = async () => {
      try {
        if (!currentUser) {
          throw new Error('No hay usuario')
        }
        if (!currentUser?.role_id){
          throw new Error('')
        }
        if (!currentUser?.cliente_id){
          throw new Error('No se encontró el cliente autenticado')
        }
          

        const mascota = mascotas.find((item) => item.Nombre === cita.mascota)
        const servicio = servicios.find((s) => s.nombre === cita.servicio)
        
        // Buscar veterinario por nombre
        const veterinario = veterinarioServicios.find(
          (v) => v.veterinario_nombre === cita.veterinario
        )
        
        // Verificar que el veterinario ofrece el servicio
        const profesional = veterinario && servicio 
          ? veterinarioServicios.find(
              (item) => item.fk_veterinario === veterinario.fk_veterinario && 
                       item.fk_servicio === servicio.id_servicio
            )
          : null

        if (!mascota || !servicio || !profesional) {
          throw new Error('No se pudo relacionar la cita con la base de datos')
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/citas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fecha_hora: `${cita.fecha} ${cita.hora}:00`,
            motivo_consulta: cita.motivo,
            fk_cliente: currentUser.cliente_id,
            fk_veterinario: profesional.fk_veterinario,
            fk_mascota: mascota.id,
            fk_servicio: servicio.id_servicio,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'No se pudo crear la cita')
        }

        setCitasAgendadas((prev) => dedupeCitas([{ id: data.id, ...cita }, ...prev]))
        toast.success('Cita agendada correctamente')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo agendar la cita')
      }
    }

    void save()
  }, [])

  const handleCancelarCita = useCallback((id: number) => {
    const remove = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/citas/${id}`, {
          method: 'DELETE',
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'No se pudo cancelar la cita')
        }

        setCitasAgendadas((prev) => prev.filter((cita) => cita.id !== id))
        toast.info('Cita cancelada')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo cancelar la cita')
      }
    }

    void remove()
  }, [])

  if (isBootstrapping) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">Cargando MediVet</p>
            <p className="text-sm text-muted-foreground">Preparando la informacion del sistema...</p>
          </div>
        </div>
        <Toaster position="top-right" />
      </>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return <LoginView onLogin={handleLogin} onBack={() => setCurrentView('dashboard')} />
      
      case 'veterinario':
        return (
          <VeterinarioView 
            cartillas={cartillas}
            mascotas={mascotas}
            tratamientos={tratamientos}
            onCreateCartilla={handleCreateCartilla}
            onUpdateCartilla={handleUpdateCartilla}
          />
        )

      case 'cartillas':
        return <CartillasView cartillas={cartillas} mascotas={mascotas} />

      case 'calendario':
        return <CalendarioView />

      case 'admin_servicios':
        return (
          <AdminServiciosView
            servicios={servicios}
            onCreateServicio={handleCreateServicio}
            onUpdateServicio={handleUpdateServicio}
            onDeleteServicio={handleDeleteServicio}
          />
        )

      case 'admin_veterinario_servicio':
        return (
          <AdminVeterinarioServicioView
            servicios={servicios}
            veterinarioServicios={veterinarioServicios}
            agendaVeterinarios={agendaVeterinarios}
            onCreateVeterinarioServicio={handleCreateVeterinarioServicio}
            onUpdateVeterinarioServicio={handleUpdateVeterinarioServicio}
            onDeleteVeterinarioServicio={handleDeleteVeterinarioServicio}
          />
        )

      case 'cliente':
        return (
          <ClienteView 
            mascotas={mascotas}
            citasAgendadas={citasAgendadas}
            cartillas={cartillas}
            tratamientos={tratamientos}
            clientId={currentUser?.cliente_id ?? null}
            userName={currentUser ? getNombreCompleto(currentUser.id) : 'Usuario'}
            onAgregarMascota={handleAgregarMascota}
          />
        )

      case 'veterinarios_lista':
        return (
          <ListaVeterinariosView
            servicios={servicios}
            mascotas={mascotas}
            veterinarioServicios={veterinarioServicios}
            agendaVeterinarios={agendaVeterinarios}
            citasAgendadas={citasAgendadas}
            onAgendarCita={handleAgendarCita}
          />
        )

      case 'citas':
        return <CitasView citas={citasAgendadas} onCancelCita={handleCancelarCita} />

      case 'settings':
        return currentUser ? (
          <SettingsView
            userId={currentUser.id}
            userName={getNombreCompleto(currentUser.id)}
            userEmail={currentUser.email}
            onProfileUpdated={({ fullName, email, nombre_usuario }) => {
              setCurrentUser((prev) =>
                prev
                  ? {
                      ...prev,
                      email,
                      nombre_usuario,
                    }
                  : prev
              )
              setNombresUsuarios((prev) => ({ ...prev, [currentUser.id]: fullName }))
              toast.success('Perfil sincronizado')
            }}
          />
        ) : (
          <SettingsView userId={0} userName="Usuario" userEmail="" />
        )

      case 'ayuda-section':
        return <AyudaSection userRole={currentUser?.role_id ?? null} />

      default:
        return (
          <div className="flex flex-col">
            <DashboardView 
              servicios={servicios} 
              onListaVeterinarios={handleListaVeterinarios}
              onLogin={() => setCurrentView('login')} 
            />
            {/* SECCIÓN DE BENEFICIOS (Se activa con el botón central de Conocer más) */}
            <section id="beneficios" className="py-24 bg-slate-50/50 border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">El Ecosistema MediVet</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto">Más que una agenda, somos el respaldo médico digital para el bienestar de tu mascota.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-slate-900">Historial en la Nube</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Accede a recetas, diagnósticos y certificados desde cualquier lugar. Tu información médica siempre segura y disponible.</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-slate-900">Agendado en Segundos</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Elige a tu especialista favorito y reserva tu cita en menos de un minuto. Sin llamadas, sin esperas.</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-slate-900">Alertas WhatsApp</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Recibe recordatorios automáticos de vacunación y desparasitación directamente en tu celular. Cero olvidos, máxima salud.</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* FOOTER CON MARCA ACTUALIZADA */}
            <footer className="py-12 bg-white border-t border-slate-100">
              <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <p className="text-slate-400 text-sm italic">© 2026 MediVet. Todos los derechos reservados.</p>
                </div>
                <div className="flex gap-6 text-sm text-slate-400">
                  <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
                  <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
                  <a href="#" className="hover:text-blue-600 transition-colors">Contacto</a>
                </div>
              </div>
            </footer>
          </div>
        )
    }
  }

  // Layout para Login
  if (currentView === 'login') {
    return (
      <>
        <LoginView onLogin={handleLogin} onBack={() => setCurrentView('dashboard')} />
        <Toaster position="top-right" />
      </>
    )
  }

  // Vista Pública Dashboard (Header Limpio)
  if (currentView === 'dashboard' && !currentUser) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold">MediVet</span>
              </div>
              <div className="flex gap-4 items-center">
                {/* Aquí solo dejamos el botón Acceder para mantener el diseño limpio */}
                <Button onClick={() => setCurrentView('login')}>
                  Acceder
                </Button>
              </div>
            </div>
          </header>
          {renderContent()}
        </div>
        <Toaster position="top-right" />
      </>
    )
  }

  return (
    <>
      <div className="flex h-screen bg-background overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <AppSidebar
            activeView={currentView}
            onNavigate={handleNavigate}
            userRole={currentUser?.role_id || null}
            userName={currentUser ? getNombreCompleto(currentUser.id) : undefined}
            onLogout={logout}
          />
        </div>

        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
      <Toaster position="top-right" />
    </>
  )
}
