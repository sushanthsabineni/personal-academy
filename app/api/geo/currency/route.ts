import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const country =
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    ''
  const currency = country.toUpperCase() === 'IN' ? 'INR' : 'USD'
  return NextResponse.json({ currency, country: country || null })
}
