import { NextResponse } from 'next/server'

import { getDataProvider } from '@/lib/data/provider'

export async function GET() {
  const provider = getDataProvider()
  const data = await provider.getBootstrapData()

  return NextResponse.json(data)
}
