import { NextRequest, NextResponse } from 'next/server'

import { getDataProvider } from '@/lib/data/provider'

export async function POST(request: NextRequest) {
  const { email, contraseña } = await request.json()
  const provider = getDataProvider()
  const result = await provider.login(email, contraseña)

  if (!result) {
    return NextResponse.json(
      { message: 'Credenciales invalidas. Verifica tu email y contraseña.' },
      { status: 401 }
    )
  }

  return NextResponse.json(result)
}
