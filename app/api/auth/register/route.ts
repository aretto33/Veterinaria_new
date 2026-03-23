import { NextRequest, NextResponse } from 'next/server'

import { getDataProvider } from '@/lib/data/provider'

export async function POST(request: NextRequest) {
  const provider = getDataProvider()

  try {
    await provider.registerUser(await request.json())
    return NextResponse.json({ message: 'Registro exitoso. Ahora puedes iniciar sesion.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear la cuenta'
    return NextResponse.json({ message }, { status: 400 })
  }
}
