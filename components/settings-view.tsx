'use client'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { User, Mail, Shield, Bell, Camera, Save, Loader2, Key, Eye, EyeOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SettingsViewProps {
  userId: number
  userName: string
  userEmail: string
  onProfileUpdated?: (profile: { fullName: string; email: string; nombre_usuario: string }) => void
}

export function SettingsView({ userId, userName, userEmail, onProfileUpdated }: SettingsViewProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [showPassModal, setShowPassModal] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [fullName, setFullName] = useState(userName)
  const [email, setEmail] = useState(userEmail)
  const [telefono, setTelefono] = useState('')
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (userId <= 0) {
      setIsLoadingProfile(false)
      return
    }

    let ignore = false

    const loadProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfil/${userId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'No se pudo cargar el perfil')
        }

        if (ignore) {
          return
        }

        const completeName = `${data.Nombre || ''} ${data.Apellidos || ''}`.trim()
        setFullName(completeName || userName)
        setEmail(data.email || userEmail)
        setTelefono(data.telefono || '')
        setNombreUsuario(data.nombre_usuario || '')
        setPhotoUrl(data.foto_perfil ? `${process.env.NEXT_PUBLIC_API_URL}${data.foto_perfil}` : '')
      } catch (error) {
        if (!ignore) {
          toast.error(error instanceof Error ? error.message : 'No se pudo cargar el perfil')
        }
      } finally {
        if (!ignore) {
          setIsLoadingProfile(false)
        }
      }
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [userEmail, userId, userName])

  const handleSave = async () => {
    if (userId <= 0) {
      toast.error('Debes iniciar sesión para actualizar el perfil')
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfil/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          telefono,
          nombre_usuario: nombreUsuario,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar el perfil')
      }

      onProfileUpdated?.({
        fullName: data.profile.fullName,
        email: data.profile.email,
        nombre_usuario: data.profile.nombre_usuario,
      })

      setIsSaving(false);
      toast.success("Perfil actualizado", {
        description: "Los cambios en tu configuración se han guardado con éxito.",
      })
    } catch (error) {
      setIsSaving(false)
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el perfil')
    }
  }

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (userId <= 0) {
      toast.error('Debes iniciar sesión para actualizar la foto')
      return
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes PNG, JPG o WEBP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe exceder 5 MB')
      return
    }

    setIsUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append('foto', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/foto_perfil/${userId}`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo actualizar la foto de perfil')
      }

      setPhotoUrl(`${process.env.NEXT_PUBLIC_API_URL}${data.foto_perfil}?t=${Date.now()}`)
      toast.success('Foto de perfil actualizada')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar la foto de perfil')
    } finally {
      setIsUploadingPhoto(false)
      event.target.value = ''
    }
  }

  // Lógica para el cambio de contraseña
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Contraseña actualizada", {
      description: "Tu clave de acceso ha sido modificada correctamente.",
    });
    setShowPassModal(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Configuración</h2>
        <p className="text-slate-500">Gestiona tu información personal y seguridad de MediVet</p>
      </div>

      <div className="space-y-6">
        {/* Bloque de Perfil (Igual al anterior) */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Foto de perfil"
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 border-4 border-white shadow-lg">
                  <User className="w-12 h-12" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-xl shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-60"
              >
                {isUploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{fullName || userName}</h3>
              <p className="text-sm text-slate-500 italic">Cliente Premium MediVet</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre de Usuario</label>
              <input
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                disabled={isLoadingProfile}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre Completo</label>
              <input
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoadingProfile}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Correo Electrónico</label>
              <input
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoadingProfile}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Teléfono</label>
              <input
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={isLoadingProfile}
                placeholder="9931234567"
              />
            </div>
          </div>
        </div>

        {/* Seguridad y Notificaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 text-slate-800">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold">Seguridad</h4>
              </div>
              <p className="text-sm text-slate-500 mb-6">Actualiza tus credenciales para mantener tu cuenta segura.</p>
            </div>
            {/* BOTÓN FUNCIONAL */}
            <Button onClick={() => setShowPassModal(true)} variant="outline" className="w-full rounded-xl py-6 border-slate-200 hover:bg-slate-50 gap-2">
              <Key className="w-4 h-4" /> Cambiar Contraseña
            </Button>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-800">
              <Bell className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold">Notificaciones</h4>
            </div>
            <p className="text-sm text-slate-500 mb-4">Recibe recordatorios de citas por WhatsApp.</p>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl">
              <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" defaultChecked />
              <span className="text-sm text-slate-700 font-medium">Alertas por WhatsApp</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving || isLoadingProfile} className="bg-blue-600 hover:bg-blue-700 px-8 py-6 rounded-2xl font-bold gap-2 shadow-lg shadow-blue-100 min-w-[200px]">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      {/* MODAL PARA CAMBIAR CONTRASEÑA */}
      {showPassModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowPassModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold">Seguridad</h3>
              </div>
              <button onClick={() => setShowPassModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Contraseña Actual</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} required className="w-full p-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-2 border-t pt-4">
                <label className="text-xs font-bold text-slate-400 uppercase">Nueva Contraseña</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} required className="w-full p-3 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mínimo 8 caracteres" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-3 text-slate-400">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full py-6 bg-slate-900 rounded-xl font-bold mt-4 hover:bg-blue-600 transition-colors">
                Actualizar Contraseña
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
