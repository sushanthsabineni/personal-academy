import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('=== TEST ENDPOINT START ===')
    
    const supabase = await createServerSupabaseClient()
    console.log('✓ Supabase client created')
    
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    
    console.log('Session check:', { hasSession: !!session, error: sessionError })
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session',
        message: 'User not logged in' 
      }, { status: 401 })
    }
    
    console.log('✓ Session found, userId:', session.user.id)
    
    // Test profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits_balance, is_premium')
      .eq('id', session.user.id)
      .single()
    
    console.log('Profile check:', { hasProfile: !!profile, error: profileError })
    
    // Test credits_transactions table
    const { data: transactions, error: transError } = await supabase
      .from('credits_transactions')
      .select('id, amount, type')
      .eq('user_id', session.user.id)
      .limit(5)
    
    console.log('Transactions check:', { count: transactions?.length || 0, error: transError })
    
    return NextResponse.json({
      success: true,
      userId: session.user.id,
      profile: profile || null,
      profileError: profileError?.message || null,
      transactionsCount: transactions?.length || 0,
      transactionsError: transError?.message || null,
    })
    
  } catch (error) {
    console.error('=== TEST ENDPOINT ERROR ===', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
