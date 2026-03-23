import { NextRequest, NextResponse } from 'next/server'

import { getDataProvider } from '@/lib/data/provider'

export async function POST(request: NextRequest) {
  const provider = getDataProvider()
  const cartilla = await provider.createCartilla(await request.json())

  return NextResponse.json(cartilla, { status: 201 })
}
