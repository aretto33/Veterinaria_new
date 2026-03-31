'use client'

import Image from 'next/image'
import {
  ArrowRight,
  Bug,
  ScanLine,
  Scissors,
  Sparkles,
  Stethoscope,
  Syringe,
} from 'lucide-react'
import { VeterinarioServicio } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Servicios, Usuario } from '@/lib/types'
import { ListaVeterinariosView } from './lista-veterinarios-view'

interface DashboardViewProps {
  servicios: Servicios[]
  onLogin: () => void
  onListaVeterinarios: () => void
}

const iconMap: Record<string, React.ElementType> = {
  'Consulta General': Stethoscope,
  Vacunacion: Syringe,
  Vacunación: Syringe,
  'Cirugia Menor': Scissors,
  'Cirugía Menor': Scissors,
  Desparasitacion: Bug,
  Desparasitación: Bug,
  'Limpieza Dental': Sparkles,
  Radiografia: ScanLine,
  Radiografía: ScanLine,
}

export function DashboardView({ servicios, onLogin, onListaVeterinarios }: DashboardViewProps) {
  const featuredServices = servicios.slice(0, 6)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf1_0%,#fffefb_35%,#f7fbfd_100%)]">
      <section className="relative overflow-hidden px-6 pb-16 pt-10 md:px-8 lg:px-12 lg:pb-24 lg:pt-14">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,241,0.98)_0%,rgba(255,252,247,0.94)_33%,rgba(255,255,255,0.65)_58%,rgba(255,255,255,0.08)_100%)]" />
          <div className="absolute right-[-2rem] top-0 h-full w-full max-w-5xl">
            <Image
              src="/portada-2.png"
              alt="Perro, gato, conejo y ave representando la atención integral de MediVet"
              fill
              priority
              className="object-contain object-right-bottom opacity-95 drop-shadow-[0_30px_50px_rgba(15,23,42,0.18)]"
              sizes="100vw"
            />
          </div>
          <div className="absolute left-[-8rem] top-10 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute right-[-5rem] top-24 h-72 w-72 rounded-full bg-cyan-200/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-emerald-200/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl py-8 lg:min-h-[38rem] lg:py-14">
            <Badge className="mb-5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white uppercase shadow-sm hover:bg-slate-900">
              Cuidado de tus macotas tabasqueñas
            </Badge>

            <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Cuidado de mascotas en Tabasco nunca pudo ser tan fácil.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              MediVet combina atención clínica, seguimiento digital y una experiencia cercana para
              perros, gatos, conejos y pequeños compañeros de casa.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={onLogin}
                className="h-14 rounded-full bg-slate-950 px-7 text-base font-semibold text-white shadow-xl shadow-slate-900/10 hover:bg-cyan-700"
              >
                Entrar a MediVet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 rounded-full border-slate-300 bg-white/80 px-7 text-base font-semibold text-slate-800 backdrop-blur hover:bg-white"
              >
                Ver servicios
              </Button>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-200/50 backdrop-blur">
                <p className="text-3xl font-black text-slate-950">+500</p>
                <p className="mt-1 text-sm text-slate-500">familias atendidas</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-200/50 backdrop-blur">
                <p className="text-3xl font-black text-slate-950">24/7</p>
                <p className="mt-1 text-sm text-slate-500">seguimiento digital</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-200/50 backdrop-blur">
                <p className="text-3xl font-black text-slate-950">98%</p>
                <p className="mt-1 text-sm text-slate-500">confianza recurrente</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="px-6 py-20 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Badge variant="outline" className="rounded-full border-cyan-200 bg-cyan-50 px-4 py-1 text-cyan-800">
                Servicios destacados
              </Badge>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Atención moderna para cada etapa de su salud.
              </h2>
              <p className="mt-3 text-lg leading-8 text-slate-600">
                Desde consultas preventivas hasta estudios y procedimientos, con una presentación
                más confiable y clara para tus pacientes.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredServices.map((servicio, index) => {
              const Icon = iconMap[servicio.nombre] || Stethoscope
              const accentStyles = [
                'from-cyan-50 to-white text-cyan-700',
                'from-amber-50 to-white text-amber-700',
                'from-emerald-50 to-white text-emerald-700',
              ]
              const accent = accentStyles[index % accentStyles.length]

              return (
                <Card
                  key={servicio.id_servicio}
                  className="overflow-hidden rounded-[2rem] border-white/70 bg-white/85 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.28)] backdrop-blur transition-transform duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="pb-5">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="pt-4 text-2xl font-bold text-slate-950">
                      {servicio.nombre}
                    </CardTitle>
                    <CardDescription className="text-base leading-7 text-slate-600">
                      {servicio.descripción}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    
                    <Button
                      variant="ghost"
                      className="h-12 w-full justify-between rounded-full bg-slate-100 px-5 text-sm font-semibold text-slate-800 hover:bg-slate-950 hover:text-white"
                      onClick={() => onListaVeterinarios()}
                    >
                      Agendar este servicio
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
