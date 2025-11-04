import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/database.types'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('❌ OAuth error:', error, error_description)
    const errorUrl = new URL('/login', requestUrl.origin)
    errorUrl.searchParams.set('error', error_description || 'Authentication failed')
    return NextResponse.redirect(errorUrl)
  }

  if (!code) {
    console.error('❌ No code provided in OAuth callback')
    return NextResponse.redirect(new URL('/login?error=No authorization code', requestUrl.origin))
  }

  try {
    console.log('🔷 OAuth callback - exchanging code for session')
    
    const cookieStore = await cookies()

    // Create Supabase client for the callback
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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Exchange code for session - this automatically sets cookies
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('❌ Session exchange error:', sessionError.message)
      return NextResponse.redirect(new URL('/login?error=Failed to establish session', requestUrl.origin))
    }

    if (!sessionData?.session || !sessionData?.user) {
      console.error('❌ No session or user data after exchange')
      return NextResponse.redirect(new URL('/login?error=No session established', requestUrl.origin))
    }

    console.log('✅ Session established for user:', sessionData.user.email)
    console.log('🍪 Cookies after exchange:', cookieStore.getAll().map(c => c.name))

    // Create admin client to check/create profile
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

    // Check if profile exists
    console.log('🔍 Checking if profile exists...')
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', sessionData.user.id)
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileCheckError)
    }

    // Create profile if it doesn't exist
    if (!existingProfile) {
      console.log('📝 Creating profile for OAuth user...')
      
      const userMetadata = sessionData.user.user_metadata || {}
      const appMetadata = sessionData.user.app_metadata || {}
      
      const profileData = {
        id: sessionData.user.id,
        email: sessionData.user.email!,
        full_name: userMetadata.full_name || userMetadata.name || sessionData.user.email?.split('@')[0] || 'User',
        avatar_url: userMetadata.avatar_url || userMetadata.picture || null,
        credits_balance: 1000,
        is_premium: false,
        is_admin: false,
        auth_provider: (appMetadata.provider as string) || 'google',
        email_verified: sessionData.user.email_confirmed_at != null,
        referral_code: generateReferralCode(),
      }

      console.log('📤 Inserting profile for:', profileData.email)

      const { error: insertError } = await (supabaseAdmin
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('profiles') as any)
        .insert(profileData)

      if (insertError) {
        // Check if it's a duplicate error (profile was created by trigger)
        if (insertError.code === '23505') {
          console.log('✅ Profile already exists (created by trigger)')
        } else {
          console.error('❌ Failed to create profile:', insertError)
          // Don't block login, profile might have been created by trigger
        }
      } else {
        console.log('✅ Profile created successfully via callback')
      }
    } else {
      console.log('✅ Profile already exists')
    }

    console.log('🎉 OAuth login complete, redirecting to dashboard')
    
    // Simply redirect - cookies were set by exchangeCodeForSession via setAll
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))

  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin))
  }
}

// Helper function to generate referral code
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
