'use client'

import { LifeBuoy, Mail, MessageCircle, Phone, PlayCircle, Stethoscope, User } from 'lucide-react'

import { AspectRatio } from '@/components/ui/aspect-ratio'

interface AyudaSectionProps {
  userRole: number | null
}

interface HelpVideo {
  title: string
  description: string
  embedUrl: string
  audienceLabel: string
}

const ayudaPorRol = {
  cliente: {
    title: 'Ayuda para Cliente',
    subtitle:
      'Aquí puedes ver cómo agendar citas, revisar cartillas y dar seguimiento a la salud de tu mascota.',
    faq: [
      {
        title: 'Como agendar una cita',
        description:
          'Entra a Servicios, elige al veterinario disponible, selecciona mascota, fecha y hora, y confirma la cita.',
      },
      {
        title: 'Como revisar el historial de mi mascota',
        description:
          'Abre la sección de Cartilla y selecciona a tu mascota para ver vacunas, desparasitaciones y notas clínicas.',
      },
    ],
    video: {
      title: 'Video para cliente',
      description: 'Guia rápida para usar citas, cartillas y el seguimiento de tu mascota.',
      embedUrl: toEmbedUrl('https://youtu.be/1NhRQHnWNS8'),
      audienceLabel: 'Clientes',
    },
    contact: {
      email: 'soporte.cliente@tudominio.com',
      phone: '+52 000 000 0001',
      message: 'Atención para dudas de citas, mascotas y cartillas.',
    },
  },
  veterinario: {
    title: 'Ayuda para Veterinario',
    subtitle:
      'Aquí tienes apoyo para revisar citas del día, actualizar cartillas y atender el flujo clínico.',
    faq: [
      {
        title: 'Como gestionar una cita',
        description:
          'Abre la agenda, revisa las citas del día y usa el estatus para confirmarlas, completarlas o cancelarlas.',
      },
      {
        title: 'Como actualizar una cartilla',
        description:
          'En el panel veterinario selecciona la mascota, captura diagnóstico, receta y tratamiento, y guarda los cambios.',
      },
    ],
    video: {
      title: 'Video para veterinario',
      description: 'Tutorial interno para revisar agenda, citas y cartillas clínicas.',
      embedUrl: toEmbedUrl('https://www.youtube.com/embed/DA8ezdFm-3o'),
      audienceLabel: 'Personal veterinario',
    },
    contact: {
      email: 'soporte.veterinario@tudominio.com',
      phone: '+52 000 000 0002',
      message: 'Atención para dudas clínicas y operación del panel veterinario.',
    },
  },
  general: {
    title: 'Centro de ayuda',
    subtitle:
      'Selecciona una sesión para ver instrucciones, dudas frecuentes y canales de soporte.',
    faq: [
      {
        title: 'Como comenzar',
        description:
          'Inicia sesión para ver las opciones que corresponden a tu rol dentro de MediVet.',
      },
      {
        title: 'Como pedir soporte',
        description:
          'Usa el correo o teléfono de atención para recibir apoyo con el acceso o el uso del sistema.',
      },
    ],
    video: {
      title: 'Video de introducción',
      description: 'Recorrido general por las principales secciones de la plataforma.',
      embedUrl: toEmbedUrl('https://youtu.be/1NhRQHnWNS8'),
      audienceLabel: 'Usuarios',
    },
    contact: {
      email: 'soporte@tudominio.com',
      phone: '+52 000 000 0000',
      message: 'Atención general para dudas del sistema.',
    },
  },
} as const

function toEmbedUrl(url: string) {
  if (url.includes('youtube.com/embed/')) {
    return url
  }

  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/)
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`
  }

  const watchMatch = url.match(/[?&]v=([^?&/]+)/)
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`
  }

  return url
}

export function AyudaSection({ userRole }: AyudaSectionProps) {
  const isVeterinario = userRole === 2
  const ayuda = isVeterinario
    ? ayudaPorRol.veterinario
    : userRole === 1
      ? ayudaPorRol.cliente
      : ayudaPorRol.general
  const title = ayuda.title
  const subtitle = ayuda.subtitle
  const faq = ayuda.faq
  const video = ayuda.video

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-[2rem] border bg-card p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-start">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Centro de ayuda</p>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                </div>
              </div>

              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{subtitle}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                    Contenido
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    Video principal, preguntas frecuentes y canales de soporte en una sola vista.
                  </p>
                </div>
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                    Audiencia
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    La sección cambia según el rol del usuario actual.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{video.title}</h2>
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                  </div>
                </div>

                <span className="rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-xs font-medium text-primary shadow-sm">
                  {video.audienceLabel}
                </span>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.9)]">
                <AspectRatio ratio={16 / 9}>
                  <iframe
                    className="h-full w-full"
                    src={video.embedUrl}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </AspectRatio>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                El reproductor mantiene proporcion 16:9 para ajustarse mejor en pantallas chicas y anchas.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              {isVeterinario ? (
                <Stethoscope className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
              <h2 className="text-xl font-semibold text-foreground">Preguntas frecuentes</h2>
            </div>

            <div className="space-y-4">
              {faq.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-2xl border p-4">
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Contacto de soporte</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {ayuda.contact.message}
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Correo</p>
                  <p className="text-sm text-muted-foreground">{ayuda.contact.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Telefono</p>
                  <p className="text-sm text-muted-foreground">{ayuda.contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <MessageCircle className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Mensaje rapido</p>
                  <p className="text-sm text-muted-foreground">{ayuda.contact.message}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
