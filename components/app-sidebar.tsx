'use client'

import { 
  Home, 
  Stethoscope, 
  PawPrint, 
  Calendar,
  FileText, 
  LogOut,
  Settings,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  activeView: string
  onNavigate: (view: string) => void
  userRole: number | null // role_id: 1=Cliente, 2=Veterinario segun diagrama UML
  userName?: string
  onLogout: () => void
}

export function AppSidebar({ 
  activeView, 
  onNavigate, 
  userRole, 
  userName,
  onLogout 
}: AppSidebarProps) {
  // Menu segun role_id del diagrama UML
  const menuItems = userRole === 2 // Veterinario
    ? [
        { id: 'veterinario', label: 'Panel Veterinario', icon: Stethoscope },
        { id: 'cartillas', label: 'Cartillas', icon: FileText },
        { id: 'calendario', label: 'Calendario', icon: Calendar },
      ]
    : userRole === 1 // Cliente
   ? [
        { id: 'cliente', label: 'Mis Mascotas', icon: PawPrint },
        { id: 'veterinarios_lista', label: 'Servicios', icon: Stethoscope }, // <--- NUEVO
        { id: 'citas', label: 'Mis Citas', icon: Calendar },
      ]
    : []

  // Obtener nombre del rol segun diagrama UML
  const getRoleName = (role_id: number | null) => {
    switch(role_id) {
      case 1: return 'Cliente'
      case 2: return 'Veterinario'
      default: return ''
    }
  }

  return (
    <aside className="flex flex-col h-full w-64 bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-primary">
          <PawPrint className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">MediVet</h1>
          <p className="text-xs text-sidebar-foreground/60">Gestion Veterinaria</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {/* Dashboard publico solo cuando no hay usuario logueado */}
          {!userRole && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeView === 'dashboard' 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
          )}

          {userRole && menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeView === item.id 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* User Section - Limpia y profesional */}
      {userRole && (
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-accent">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60">
                {getRoleName(userRole)} {/* Quitamos (role_id: {userRole}) */}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configuracion {/* Antes decía update_perfil() */}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión {/* Antes decía logout() */}
          </button>
        </div>
      )}

      {/* Login Button for non-authenticated users */}
      {!userRole && (
        <div className="px-3 py-4 border-t border-sidebar-border">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium hover:bg-sidebar-primary/90 transition-colors"
          >
            <User className="w-4 h-4" />
            login()
          </button>
        </div>
      )}
    </aside>
  )
}
