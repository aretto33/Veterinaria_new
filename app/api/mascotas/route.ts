import { NextRequest, NextResponse } from 'next/server'

import { getDataProvider } from '@/lib/data/provider'

export async function POST(request: NextRequest) {
  const provider = getDataProvider()
  const mascota = await provider.createMascota(await request.json())

  return NextResponse.json(mascota, { status: 201 })
}
