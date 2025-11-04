import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  balance_after: number
  created_at: string
  payment_id: string | null
  metadata: unknown
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  created_at: string
}

interface Profile {
  credits_balance: number
  is_premium: boolean
  full_name: string | null
  email: string
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: 'Unauthorized', details: sessionError.message },
        { status: 401 }
      )
    }
    
    if (!session) {
      console.error('No active session')
      return NextResponse.json(
        { error: 'Unauthorized - No active session' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    console.log('Fetching credits for user:', userId)

    // Get user profile with current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_balance, is_premium, full_name, email')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      // If profile doesn't exist, return default values
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({
          currentBalance: 0,
          isPremium: false,
          stats: {
            totalEarned: 0,
            totalSpent: 0,
            totalPurchased: 0,
            storyboardsCreated: 0,
          },
          transactions: [],
        })
      }
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      )
    }

    if (!profile) {
      // Profile not found, return default values
      return NextResponse.json({
        currentBalance: 0,
        isPremium: false,
        stats: {
          totalEarned: 0,
          totalSpent: 0,
          totalPurchased: 0,
          storyboardsCreated: 0,
        },
        transactions: [],
      })
    }

    const typedProfile = profile as Profile

    // Fetch all credit transactions for the user
    const { data: transactions, error: transactionsError } = await supabase
      .from('credits_transactions')
      .select(`
        id,
        amount,
        type,
        description,
        balance_after,
        created_at,
        payment_id,
        metadata
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    const typedTransactions = (transactions || []) as Transaction[]

    // Fetch payment details for purchase transactions
    const paymentIds = typedTransactions
      .filter(t => t.payment_id)
      .map(t => t.payment_id)
      .filter((id): id is string => id !== null)

    let payments: Payment[] = []
    if (paymentIds.length > 0) {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, currency, status, created_at')
        .in('id', paymentIds)

      if (!paymentsError && paymentsData) {
        payments = paymentsData as Payment[]
      }
    }

    // Calculate stats
    const totalEarned = typedTransactions
      .filter(t => ['earned', 'bonus', 'referral'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0)

    const totalSpent = Math.abs(
      typedTransactions
        .filter(t => t.type === 'spent')
        .reduce((sum, t) => sum + t.amount, 0)
    )

    const totalPurchased = typedTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0)

    // Count AI generations (storyboards created)
    const { count: aiGenerationsCount } = await supabase
      .from('ai_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('generation_type', 'storyboard')

    // Get credits expiring soon (within 30 days)
    const { data: expiringCredits } = await supabase
      .from('credits_transactions')
      .select('amount, expires_at')
      .eq('user_id', userId)
      .gt('amount', 0)
      .not('expires_at', 'is', null)
      .gte('expires_at', new Date().toISOString())
      .lte('expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('expires_at', { ascending: true })

    const typedExpiringCredits = expiringCredits as Array<{ amount: number; expires_at: string }> | null
    const expiringAmount = typedExpiringCredits?.reduce((sum, credit) => sum + credit.amount, 0) || 0
    const nearestExpiry = typedExpiringCredits?.[0]?.expires_at || null

    let daysUntilExpiry = null
    if (nearestExpiry) {
      const days = Math.ceil((new Date(nearestExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      daysUntilExpiry = days > 0 ? days : 0
    }

    // Map transactions to include payment info and invoice_number for frontend compatibility
    const transactionsWithPayments = typedTransactions.map(transaction => {
      const payment = payments.find(p => p.id === transaction.payment_id)
      return {
        ...transaction,
        invoice_number: null, // Column doesn't exist in DB yet
        payment_amount: payment?.amount || null,
        payment_currency: payment?.currency || null,
      }
    })

    return NextResponse.json({
      currentBalance: typedProfile.credits_balance,
      isPremium: typedProfile.is_premium,
      userProfile: {
        fullName: typedProfile.full_name,
        email: typedProfile.email,
      },
      expiryInfo: {
        expiringAmount,
        daysUntilExpiry,
        nearestExpiry,
      },
      stats: {
        totalEarned,
        totalSpent,
        totalPurchased,
        storyboardsCreated: aiGenerationsCount || 0,
      },
      transactions: transactionsWithPayments,
    })

  } catch (error) {
    console.error('Error in credits API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
