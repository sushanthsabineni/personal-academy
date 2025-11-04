import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

    if (!publicKey) {
      return NextResponse.json(
        { error: 'VAPID public key is not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({ publicKey })
  } catch (error) {
    console.error('Error in VAPID public key endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
