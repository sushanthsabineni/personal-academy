import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore - cookies set in Server Component
            }
          },
        },
      }
    )
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('create-profile session error:', sessionError.message)
      return NextResponse.json({ error: 'Failed to validate session' }, { status: 500 })
    }

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as {
      userId?: string
      email?: string
      fullName?: string
      authProvider?: string
    }

    if (body.userId && body.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const email = body.email ?? session.user.email

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const provider =
      body.authProvider ??
      (session.user.app_metadata?.provider as string | undefined) ??
      'email'

    const resolvedFullName =
      body.fullName ??
      session.user.user_metadata?.full_name ??
      session.user.email?.split('@')[0] ??
      email.split('@')[0]

    const { data: existingProfile, error: lookupError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single()

    if (lookupError && lookupError.code !== 'PGRST116') {
      console.error('create-profile lookup error:', lookupError)
    }

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
      })
    }

    const profileData: Database['public']['Tables']['profiles']['Insert'] = {
      id: session.user.id,
      email,
      full_name: resolvedFullName,
      credits_balance: 1000,
      is_premium: false,
      auth_provider: provider,
      referral_code: generateReferralCode(),
      email_verified: session.user.email_confirmed_at != null,
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(profileData as never)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Profile already exists',
        })
      }

      console.error('create-profile insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create profile', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: 'Profile created successfully',
    })
  } catch (error) {
    console.error('create-profile unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore - cookies set in Server Component
            }
          },
        },
      }
    )
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('create-profile session error:', sessionError.message)
      return NextResponse.json({ error: 'Failed to validate session' }, { status: 500 })
    }

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') ?? session.user.id
    const email = searchParams.get('email') ?? session.user.email

    if (userId !== session.user.id && email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let query = supabaseAdmin.from('profiles').select('id, email, full_name, is_admin, credits_balance')

    if (userId) {
      query = query.eq('id', userId)
    } else if (email) {
      query = query.eq('email', email)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          exists: false,
          profile: null,
        })
      }

      console.error('create-profile fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to check profile', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      exists: true,
      profile: data,
    })
  } catch (error) {
    console.error('create-profile unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
