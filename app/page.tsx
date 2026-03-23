'use client'

import { useState, useCallback, useEffect } from 'react'
import { Usuario, Cartilla_Vacunacion, Mascotas, Servicios } from '@/lib/types'
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
import { Menu, X, ShieldCheck, Smartphone, MessageCircle, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

type View = 'dashboard' | 'login' | 'veterinario' | 'cliente' | 'cartillas' | 'calendario' | 'citas' | 'settings' | 'veterinarios_lista'

export default function MediVetApp() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [servicios, setServicios] = useState<Servicios[]>([])
  const [cartillas, setCartillas] = useState<Cartilla_Vacunacion[]>([])
  const [mascotas, setMascotas] = useState<Mascotas[]>([])
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

  const handleLogin = useCallback((user: Usuario, fullName: string) => {
    setCurrentUser(user)
    setNombresUsuarios((prev) => ({ ...prev, [user.id]: fullName }))
    if (user.role_id === 2) {
      setCurrentView('veterinario')
    } else {
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
        throw new Error('No se pudo actualizar la cartilla')
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
            onCreateCartilla={handleCreateCartilla}
            onUpdateCartilla={handleUpdateCartilla}
          />
        )

      case 'cartillas':
        return <CartillasView cartillas={cartillas} mascotas={mascotas} />

      case 'calendario':
        return <CalendarioView />

      case 'cliente':
        return (
          <ClienteView 
            mascotas={mascotas}
            cartillas={cartillas}
            userName={currentUser ? getNombreCompleto(currentUser.id) : 'Usuario'}
            onAgregarMascota={handleAgregarMascota}
          />
        )

      case 'veterinarios_lista':
        return <ListaVeterinariosView servicios={servicios} />

      case 'citas': 
        return <CitasView mascotas={mascotas} servicios={servicios} />

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

      default:
        return (
          <div className="flex flex-col">
            <DashboardView 
              servicios={servicios} 
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
