import { NextRequest, NextResponse } from 'next/server'
import { checkServerAuth, createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const user = await checkServerAuth()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only allow admins to query service configuration state
    const supabase = await createServerSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!(profile as any)?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { service } = await request.json()

    if (service === 'openrouter') {
      const apiKey = process.env.OPENROUTER_API_KEY
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OpenRouter API key not configured' },
          { status: 500 }
        )
      }
      // Do not return raw API keys to the client
      return NextResponse.json({ configured: true })
    }

    return NextResponse.json(
      { error: 'Unknown service' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in get-api-key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
