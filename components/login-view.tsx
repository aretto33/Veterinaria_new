'use client'

import { useState } from 'react'
import { Usuario } from '@/lib/types'
import { 
  PawPrint, Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone, 
  Briefcase, MapPin, Stethoscope, UserCircle 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface LoginViewProps {
  onLogin: (user: Usuario, fullName: string) => void
  onBack: () => void
}

type ViewMode = 'login' | 'register' | 'select-role'
// Credenciales demo para acceder a la app por si aún no exite algún usuario
const demoCredentials = {
  cliente: {
    email: 'cliente@digicom.com',
    contraseña: 'cliente123',
  },
  veterinario: {
    email: 'veterinario@digicom.com',
    contraseña: 'vet123',
  },
}

export function LoginView({ onLogin, onBack }: LoginViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('login')
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  
  // Campos segun diagrama UML: email y contraseña
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Campos para registro - Usuario
  const [nombre_usuario, setNombreUsuario] = useState('')
  const [confirmContraseña, setConfirmContraseña] = useState('')
  
  // Campos para Perfil_Usuario
  const [telefono, setTelefono] = useState('')
  const [Nombre, setNombre] = useState('')
  const [Apellidos, setApellidos] = useState('')

  // Campos adicionales para Veterinario
  const [cedula_prof, setCedulaProf] = useState('')
  const [direcc_consultorio, setDireccConsultorio] = useState('')
  const [Especialidad, setEspecialidad] = useState('')

  // Metodo login() segun diagrama UML de la clase Usuario
  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contraseña }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo iniciar sesion')
      }

      onLogin(data.user, data.fullName)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo iniciar sesion')
    }

    setIsLoading(false)
  }

  // Registro de nuevo usuario
  const registrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    // Validaciones
    if (contraseña !== confirmContraseña) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_id: selectedRoleId,
          nombre_usuario,
          email,
          contraseña,
          telefono,
          Nombre,
          Apellidos,
          cedula_prof,
          direcc_consultorio,
          Especialidad,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo crear la cuenta')
      }

      setSuccess(data.message || 'Registro exitoso. Ahora puedes iniciar sesion.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo crear la cuenta')
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    
    // Resetear formulario y volver al login
    setTimeout(() => {
      resetForm()
      setViewMode('login')
    }, 2000)
  }

  const resetForm = () => {
    setEmail('')
    setContraseña('')
    setConfirmContraseña('')
    setNombreUsuario('')
    setTelefono('')
    setNombre('')
    setApellidos('')
    setCedulaProf('')
    setDireccConsultorio('')
    setEspecialidad('')
    setError('')
    setSuccess('')
    setSelectedRoleId(null)
  }

  const handleDemoLogin = (role_id: number) => {
    const demoUser = role_id === 2 ? demoCredentials.veterinario : demoCredentials.cliente
    setEmail(demoUser.email)
    setContraseña(demoUser.contraseña)
  }

  const handleSelectRole = (roleId: number) => {
    setSelectedRoleId(roleId)
    setViewMode('register')
  }

  // Vista de seleccion de rol
  if (viewMode === 'select-role') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
        <div className="w-full max-w-lg">
          <Button 
            variant="ghost" 
            className="mb-6 gap-2"
            onClick={() => setViewMode('login')}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al login
          </Button>

          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mx-auto mb-4">
                <PawPrint className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Crear cuenta en MediVet</CardTitle>
              <CardDescription>
                Selecciona el tipo de cuenta que deseas crear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {/* Opcion Cliente - role_id: 1 */}
                <button
                  onClick={() => handleSelectRole(1)}
                  className="flex items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <UserCircle className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Cliente</h3>
                    <p className="text-sm text-muted-foreground">
                      Registra tus mascotas, agenda citas y accede a su historial medico
                    </p>
                  </div>
                </button>

                {/* Opcion Veterinario - role_id: 2 */}
                <button
                  onClick={() => handleSelectRole(2)}
                  className="flex items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all text-left group"
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-teal-100 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Veterinario</h3>
                    <p className="text-sm text-muted-foreground">
                      Gestiona cartillas de vacunacion, diagnosticos y atiende pacientes
                    </p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Vista de registro
  if (viewMode === 'register') {
    const isVeterinario = selectedRoleId === 2
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
        <div className="w-full max-w-lg">
          <Button 
            variant="ghost" 
            className="mb-6 gap-2"
            onClick={() => {
              resetForm()
              setViewMode('select-role')
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Cambiar tipo de cuenta
          </Button>

          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center pb-2">
              <div className={`flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4 ${isVeterinario ? 'bg-accent' : 'bg-primary'}`}>
                {isVeterinario ? (
                  <Stethoscope className="w-8 h-8 text-accent-foreground" />
                ) : (
                  <UserCircle className="w-8 h-8 text-primary-foreground" />
                )}
              </div>
              <CardTitle className="text-2xl">
                Registro de {isVeterinario ? 'Veterinario' : 'Cliente'}
              </CardTitle>
              <CardDescription>
                Completa los datos para crear tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={registrarUsuario} className="space-y-4">
                {/* Seccion: Datos de Usuario */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Datos de Usuario
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg_email" className="text-xs">email</Label>
                      <Input
                        id="reg_email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg_contraseña" className="text-xs">contraseña</Label>
                      <div className="relative">
                        <Input
                          id="reg_contraseña"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="********"
                          value={contraseña}
                          onChange={(e) => setContraseña(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm_contraseña" className="text-xs">Confirmar contraseña</Label>
                      <div className="relative">
                        <Input
                          id="confirm_contraseña"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="********"
                          value={confirmContraseña}
                          onChange={(e) => setConfirmContraseña(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seccion: Perfil_Usuario */}
                <div className="space-y-3 pt-2 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    Perfil de Usuario
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="Nombre" className="text-xs">Nombre</Label>
                      <Input
                        id="Nombre"
                        placeholder="Juan"
                        value={Nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="Apellidos" className="text-xs">Apellidos</Label>
                      <Input
                        id="Apellidos"
                        placeholder="Perez Garcia"
                        value={Apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="telefono" className="text-xs">telefono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="telefono"
                        type="tel"
                        placeholder="5551234567"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seccion: Datos de Veterinario (solo si role_id = 2) */}
                {isVeterinario && (
                  <div className="space-y-3 pt-2 border-t">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Datos de Veterinario
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="cedula_prof" className="text-xs">cedula</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="cedula_prof"
                            type="number"
                            placeholder="12345678"
                            value={cedula_prof}
                            onChange={(e) => setCedulaProf(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="Especialidad" className="text-xs">Especialidad</Label>
                        <Input
                          id="Especialidad"
                          placeholder="Medicina General"
                          value={Especialidad}
                          onChange={(e) => setEspecialidad(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="direcc_consultorio" className="text-xs">direccion</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="direcc_consultorio"
                          placeholder="Av. Principal #123, Consultorio 4"
                          value={direcc_consultorio}
                          onChange={(e) => setDireccConsultorio(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded-lg bg-green-100 text-green-700 text-sm">
                    {success}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className={`w-full ${isVeterinario ? 'bg-accent hover:bg-accent/90' : ''}`} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Crear cuenta'}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Ya tienes cuenta?{' '}
                <button 
                  onClick={() => {
                    resetForm()
                    setViewMode('login')
                  }}
                  className="text-primary hover:underline"
                >
                  Iniciar sesion
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Vista de Login (default)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Button>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mx-auto mb-4">
              <PawPrint className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Bienvenido a MediVet</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={login} className="space-y-4">
              {/* Campo email segun diagrama UML */}
              <div className="space-y-2">
                <Label htmlFor="email">email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Campo contraseña segun diagrama UML */}
              <div className="space-y-2">
                <Label htmlFor="contraseña">contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contraseña"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando sesion...' : 'login'}
              </Button>
            </form>

          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          No tienes cuenta?{' '}
          <button 
            onClick={() => setViewMode('select-role')}
            className="text-primary hover:underline"
          >
            Registrarse
          </button>
        </p>
      </div>
    </div>
  )
}
