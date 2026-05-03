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

const clienteFaq = [
  {
    title: 'Como agendar una cita',
    description: 'Explica aqui el paso a paso para que el cliente reserve una cita.'
  },
  {
    title: 'Como revisar el historial de mi mascota',
    description: 'Explica aqui el paso a paso para que el cliente reserve una cita.'
  },
]

const veterinarioFaq = [
  {
    title: 'Como gestionar una cita',
    description: 'Explica aqui el paso a paso para que el cliente reserve una cita.'
  },
  {
    title: 'Como actualizar una cartilla',
    description: 'Explica aqui el paso a paso para que el cliente reserve una cita.'
  },
]

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

const vetVideo: HelpVideo = {
  title: 'Video para veterinario',
  description: 'Puedes reemplazar este tutorial por el video oficial de uso interno de tu clinica.',
  embedUrl: toEmbedUrl('https://www.youtube.com/embed/DA8ezdFm-3o'),
  audienceLabel: 'Personal veterinario',
}

const cliVideo: HelpVideo = {
  title: 'Video para cliente',
  description: 'Comparte aqui una guia breve para explicar el flujo principal del portal.',
  embedUrl: toEmbedUrl('https://youtu.be/1NhRQHnWNS8'),
  audienceLabel: 'Clientes',
}

export function AyudaSection({ userRole }: AyudaSectionProps) {
  const isVeterinario = userRole === 2
  const title = isVeterinario ? 'Ayuda para Veterinario' : 'Ayuda para Cliente'
  const subtitle = isVeterinario
    ? 'Plantilla base para documentar procesos, dudas frecuentes y soporte para el personal veterinario.'
    : 'Plantilla base para explicar citas, cartillas, pagos y cualquier duda comun de tus clientes.'
  const faq = isVeterinario ? veterinarioFaq : clienteFaq
  const video = isVeterinario ? vetVideo : cliVideo

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
                    Video principal, FAQ y canales de soporte en una sola vista.
                  </p>
                </div>
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                    Audiencia
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    La seccion cambia segun el rol del usuario actual.
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
              Reemplaza estos datos con el correo, telefono o canal real de tu clinica.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Correo</p>
                  <p className="text-sm text-muted-foreground">soporte@tudominio.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Telefono</p>
                  <p className="text-sm text-muted-foreground">+52 000 000 0000</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <MessageCircle className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Mensaje rapido</p>
                  <p className="text-sm text-muted-foreground">Atendemos dudas de lunes a viernes.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
