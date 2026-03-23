import { NextRequest, NextResponse } from 'next/server'

import { getDataProvider } from '@/lib/data/provider'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const provider = getDataProvider()

  try {
    const { id } = await params
    const cartilla = await provider.updateCartilla(Number(id), await request.json())
    return NextResponse.json(cartilla)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar la cartilla'
    return NextResponse.json({ message }, { status: 400 })
  }
}
