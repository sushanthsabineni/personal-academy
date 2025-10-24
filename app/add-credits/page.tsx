'use client'

import { useState, useEffect } from 'react'
import { getUserInfo } from '@/lib/auth'
import { getCreditBalance, purchaseCredits } from '@/lib/creditManagement'
import { useRouter } from 'next/navigation'

export default function AddCreditsPage() {
  const router = useRouter()
  const [credits, setCredits] = useState(3000)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const user = getUserInfo()
    if (user) {
      const balance = getCreditBalance(user.email)
      setCurrentBalance(balance.availableCredits)
    }
  }, [])

  const handleAddCredits = () => {
    const user = getUserInfo()
    if (!user) {
      setMessage('Please log in first')
      return
    }

    const success = purchaseCredits(
      credits,
      'manual-add',
      `MANUAL-${Date.now()}`
    )

    if (success) {
      const newBalance = getCreditBalance(user.email)
      setCurrentBalance(newBalance.availableCredits)
      setMessage(`✅ Successfully added ${credits} credits! New balance: ${newBalance.availableCredits}`)
      
      // Redirect to credits page after 2 seconds
      setTimeout(() => {
        router.push('/account/credits')
      }, 2000)
    } else {
      setMessage('❌ Failed to add credits')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Add Credits Manually
        </h1>
        
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Current Balance: <span className="font-bold text-brand-teal">{currentBalance}</span> credits
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Credits to Add
          </label>
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleAddCredits}
          className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-semibold py-3 rounded-lg transition-colors"
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
