'use client'

// React
import { useState, useEffect } from 'react'

// Next.js
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Supabase
import { supabase } from '@/lib/supabase/client'

// Components - lazy loaded
const RazorpayPaymentModal = dynamic(() => import('@/components/RazorpayPaymentModal'), {
  ssr: false,
  loading: () => null
})
import RazorpayScript from '@/components/RazorpayScript'
import type { PricingTier } from '@/lib/razorpay.types'

// External libraries
import { Check } from '@/lib/icons'

// Analytics
import { trackPremiumInterest } from '@/lib/analytics'

export default function PricingPage() {
  const [currency, setCurrency] = useState('USD')
  const [selectedCredits, setSelectedCredits] = useState('1000')
  const [plans, setPlans] = useState<Array<{ id: string; name: string; credits: number; prices: { INR: number; USD: number }; is_popular?: boolean }>>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Fetch user data from Supabase
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUserEmail(session.user.email || '')
          
          // Fetch profile for full name
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();

          const profile = data as { full_name: string | null } | null;
          if (profile) {
            setUserName(profile.full_name || session.user.email?.split('@')[0] || '')
          } else {
            setUserName(session.user.email?.split('@')[0] || '')
          }
        } else {
          setUserEmail('')
          setUserName('')
        }
      } catch (error) {
        console.error('pricing: user fetch error', error)
      }
    }
    fetchUser()

    const detectCurrency = async () => {
      try {
        const res = await fetch('/api/geo/currency', { cache: 'no-store' })
        const data = await res.json()
        setCurrency(data.currency === 'INR' ? 'INR' : 'USD')
      } catch { setCurrency('USD') }
    }
    detectCurrency()

    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/pricing/plans', { cache: 'no-store' })
        const data = await res.json()
        const mapped = (data.plans || []).map((p: any) => ({
          id: String(p.id),
          name: p.name,
          credits: p.credits,
          prices: { INR: p.price_in_inr, USD: p.price_in_usd || Math.round(p.price_in_inr / 83) },
          is_popular: p.is_popular,
        }))
        setPlans(mapped)
        if (mapped.length) setSelectedCredits(String(mapped[0].credits))
      } catch (e) {
        console.error('pricing: failed to load plans', e)
      }
    }
    fetchPlans()
  }, [])

  const pricingOptions = plans.map(p => ({
    value: String(p.credits),
    name: p.name,
    credits: p.credits,
    prices: p.prices,
    popular: p.is_popular,
  }))

  // Guard against initial render before plans are loaded
  const selectedOption = pricingOptions.find(opt => opt.value === selectedCredits)

  // Render a lightweight loading state until plans are available
  if (!selectedOption) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-display font-bold mb-3 text-light-text dark:text-dark-text">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-light-muted dark:text-dark-muted max-w-2xl mx-auto">
              Loading plans...
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-light-card dark:bg-dark-card border-2 border-brand-teal rounded-xl shadow-2xl p-8">
              <div className="flex items-center justify-center py-16">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-teal border-r-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const price = selectedOption.prices[currency as keyof typeof selectedOption.prices]
  const selectedDiscount: number = (selectedOption as any).discount ?? 0

  const features = [
    'Approx 250 credits per standard storyboard',
    'Unlimited course storage (90 days republish)',
    'Standard export formats (Doc, PPT, PDF)',
    'Email support',
  ]

  // Create tier object for payment modal
  const getTierForPayment = (): PricingTier => ({
    id: selectedOption.value,
    name: selectedOption.name,
    credits: selectedOption.credits,
    prices: selectedOption.prices,
  })

  const handlePurchase = () => {
    trackPremiumInterest('pricing_page')
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-display font-bold mb-3 text-light-text dark:text-dark-text">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-light-muted dark:text-dark-muted max-w-2xl mx-auto">
            Create professional storyboards with our flexible credit system.
          </p>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-light-card dark:bg-dark-card border-2 border-brand-teal rounded-xl shadow-2xl p-8">
            
            {/* Dropdown Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-light-text dark:text-dark-text">
                Select Credit Package
              </label>
              <select
                value={selectedCredits}
                onChange={(e) => setSelectedCredits(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all text-lg font-medium"
              >
                {pricingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Display */}
            <div className="text-center mb-6">
              <div className="mb-2">
                <span className="text-6xl font-bold text-brand-teal">
                  {currency === 'INR' ? '₹' : '$'}{price.toLocaleString()}
                </span>
              </div>
              <p className="text-light-muted dark:text-dark-muted">
                One-time payment • {selectedOption.credits.toLocaleString()} credits
              </p>
              {selectedDiscount > 0 && (
                <div className="inline-block mt-2 px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                  SAVE {selectedDiscount}%
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">
                What&apos;s Included:
              </h3>
              <ul className="space-y-3">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check size={20} className="text-brand-teal flex-shrink-0 mt-0.5" />
                    <span className="text-light-text dark:text-dark-text">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={handlePurchase}
              className="w-full h-14 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg"
            >
              Purchase Credits
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-light-text dark:text-dark-text">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'What if I run out of credits?',
                a: 'Simply purchase more! You can buy additional credits anytime.',
              },
              {
                q: 'Can I upgrade my plan?',
                a: 'Yes! Any time you can purchase a higher tier. Credits stack up in your account.',
              },
              {
                q: 'How many credits do I need for one storyboard?',
                a: 'On average, a complete standard storyboard with 6-8 modules costs approximately 250 credits.',
              },
              {
                q: 'Do you offer discounts for bulk purchases?',
                a: 'Yes! The 3,000 credits package offers 10% savings and the 5,000 credits package offers 20% savings.',
              },
              {
                q: 'Can I share credits with my team?',
                a: 'Currently, credits are tied to individual accounts. For team plans, please contact our support team.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), UPI, net banking, and mobile wallets through Razorpay. International cards are also supported.',
              },
              {
                q: 'How long do my credits last?',
                a: 'Unused credits expire after 365 days from the date of purchase. Make sure to use them within this period!',
              },
              {
                q: 'What does "90 days republish" mean?',
                a: 'You can access and republish your created courses for 90 days after creation. After that, your course data remains stored but needs to be regenerated.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-light-card dark:bg-dark-card p-6 rounded-lg border border-light-border dark:border-dark-border">
                <h3 className="font-semibold mb-2 text-light-text dark:text-dark-text">
                  {faq.q}
                </h3>
                <p className="text-sm text-light-muted dark:text-dark-muted">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Notice */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              ⚠️ Important Information
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  <strong>No Refunds:</strong> All credit purchases are final and non-refundable. 
                  Please review our{' '}
                  <Link href="/trust/terms-of-service" className="underline hover:text-blue-600">
                    Terms of Service
                  </Link>{' '}
                  for details.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  <strong>Credit Expiration:</strong> Credits expire 365 days from purchase date 
                  and cannot be recovered after expiration.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  <strong>Payment Processing:</strong> Payments are processed securely via Razorpay 
                  with support for credit/debit cards, UPI, net banking, and wallets. We do not store your card details.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  By purchasing, you agree to our{' '}
                  <Link href="/trust/terms-of-service" className="underline hover:text-blue-600">
                    Terms of Service
                  </Link>
                  {', '}
                  <Link href="/trust/terms-of-use" className="underline hover:text-blue-600">
                    Terms of Use
                  </Link>
                  {', and '}
                  <Link href="/trust/privacy" className="underline hover:text-blue-600">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Razorpay Script Loader */}
      <RazorpayScript />

      {/* Payment Modal */}
      <RazorpayPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tier={getTierForPayment()}
        currency={currency}
        userEmail={userEmail}
        userName={userName}
      />
    </div>
  )
}
