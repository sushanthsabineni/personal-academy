/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import type { Database } from '@/lib/supabase/database.types'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AddCreditsPage() {
  const router = useRouter()
  const [credits, setCredits] = useState(3000)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      setUserEmail(session.user.email || '')

      const { data, error } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', session.user.id)
        .single();

      const profile = data as { credits_balance: number } | null;
      if (error || !profile) {
        setMessage('You do not have permission to access this page.');
        setTimeout(() => router.replace('/dashboard'), 2000);
        return;
      }

      setIsAuthorized(true);
      setCurrentBalance(profile.credits_balance ?? 0);
    }

    loadUserData()
  }, [router])

  const handleAddCredits = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      setMessage('Please log in first.')
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits_balance, is_admin')
        .eq('id', session.user.id)
        .single();
      const profile = data as { credits_balance: number; is_admin: boolean } | null;

      if (error) throw error
      if (!profile?.is_admin) {
        setMessage('You do not have permission to add credits.')
        return
      }

      const newBalance = (profile.credits_balance || 0) + credits

      const { error: updateError } = await (supabase
        .from('profiles')
        .update({ credits_balance: newBalance } as never)
        .eq('id', session.user.id) as any);

      if (updateError) throw updateError

      await supabase.from('credits_transactions').insert({
        user_id: session.user.id,
        amount: credits,
        type: 'bonus',
        description: 'Admin add credits',
        balance_after: newBalance,
        transaction_type: 'admin_add',
        payment_method: 'manual',
        payment_id: '',
        status: 'completed',
      } as any);

      setCurrentBalance(newBalance)
      setMessage(`Successfully added ${credits} credits. New balance: ${newBalance}.`)

      setTimeout(() => {
        router.push('/account/credits')
      }, 2000)
    } catch (error) {
      console.error('add-credits: error adding credits', error)
      setMessage('Failed to add credits. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Add Credits Manually
        </h1>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            User:{' '}
            <span className="font-medium">
              {userEmail || 'Loading…'}
            </span>
          </p>
          <p>
            Current Balance:{' '}
            <span className="font-bold text-brand-teal">
              {currentBalance}
            </span>{' '}
            credits
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Credits to Add
          </label>
          <input
            type="number"
            value={credits}
            min={0}
            onChange={(e) => setCredits(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
            disabled={!isAuthorized}
          />
        </div>

        <button
          onClick={handleAddCredits}
          className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isAuthorized}
        >
          Add Credits
        </button>

        {message && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-900 dark:text-white text-sm">
            {message}
          </div>
        )}

        <button
          onClick={() => router.push('/account/credits')}
          className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Go to Credits Page
        </button>
      </div>
    </div>
  )
}
