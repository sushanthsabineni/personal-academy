'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check } from '@/lib/icons'

export default function PublicPricingPage() {
  const router = useRouter()
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    // Detect location (mock - in production use IP geolocation API)
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()

        if (data.country_code === 'IN') {
          setCurrency('INR')
        } else if (data.country_code === 'GB') {
          setCurrency('GBP')
        } else if (data.country_code === 'AU') {
          setCurrency('AUD')
        } else {
          setCurrency('USD')
        }
      } catch {
        setCurrency('USD')
      }
    }
    detectLocation()
  }, [])

  const tiers = [
    {
      name: 'Starter',
      credits: 1000,
      storyboards: 4,
      prices: { INR: 999, USD: 15, GBP: 11, AUD: 23 },
      savings: 0,
      features: [
        'Perfect for getting started',
        '4 complete storyboards',
        'Up to 3 saved courses',
        'Standard export formats',
        'Email support',
      ],
      highlighted: false,
    },
    {
      name: 'Growth',
      credits: 3000,
      storyboards: 12,
      prices: { INR: 2699, USD: 41, GBP: 32, AUD: 63 },
      savings: 10,
      features: [
        'Best for active creators',
        '12 complete storyboards',
        'Unlimited course storage',
        'All export formats + SCORM',
        'Priority support',
        'AI enhancement features',
      ],
      highlighted: false,
    },
    {
      name: 'Scale',
      credits: 5000,
      storyboards: 20,
      prices: { INR: 4249, USD: 65, GBP: 51, AUD: 100 },
      savings: 15,
      features: [
        'Maximum value & savings',
        '20 complete storyboards',
        'Unlimited course storage',
        'All premium features',
        'Dedicated support',
        'Advanced analytics',
        'Priority feature access',
      ],
      highlighted: true,
    },
  ]

  const getPrice = (tier: typeof tiers[0]) => {
    return tier.prices[currency as keyof typeof tier.prices] || tier.prices.USD
  }

  const getSavings = (tier: typeof tiers[0]) => {
    if (tier.savings === 0) return 'NEW USER'
    return `-${tier.savings}%`
  }

  const handleGetStarted = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-5xl font-display font-bold mb-3 text-light-text dark:text-dark-text">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-light-muted dark:text-dark-muted max-w-2xl mx-auto">
            Create storyboards with our affordable credit system.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-xl transition-all ${
                tier.highlighted
                  ? 'bg-light-card dark:bg-dark-card border-2 border-brand-teal shadow-2xl scale-105'
                  : 'bg-light-card dark:bg-dark-card border-2 border-light-border dark:border-dark-border hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-teal text-white text-sm font-bold rounded-full">
                  BEST VALUE
                </div>
              )}

              {tier.savings === 0 && !tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-light-muted dark:bg-dark-muted text-light-bg dark:text-dark-bg text-sm font-bold rounded-full">
                  NEW USER
                </div>
              )}

              {tier.savings > 0 && !tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                  {getSavings(tier)}
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2 text-light-text dark:text-dark-text">
                  {tier.name}
                </h3>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-5xl font-bold text-brand-teal">
                    {currency === 'INR' ? '₹' : currency === 'GBP' ? '£' : currency === 'AUD' ? '$' : '$'}
                    {getPrice(tier).toLocaleString()}
                  </span>
                  <span className="text-light-muted dark:text-dark-muted">
                    {currency === 'INR' ? ' one-time' : ' one-time'}
                  </span>
                </div>

                {/* Per Credit Cost */}
                <p className="text-xs text-light-muted dark:text-dark-muted mb-6">
                  {currency === 'INR' ? '₹' : '$'}{(getPrice(tier) / tier.credits).toFixed(2)}/credit
                </p>

                {/* Storyboards */}
                <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg mb-6">
                  <div className="text-3xl font-bold text-brand-teal mb-1">
                    {tier.storyboards}
                  </div>
                  <div className="text-sm text-light-muted dark:text-dark-muted">
                    Complete storyboards
                  </div>
                  <div className="text-xs text-light-muted dark:text-dark-muted mt-2">
                    6-8 modules • ~60 mins each
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={20} className="text-brand-teal flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-light-text dark:text-dark-text">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={handleGetStarted}
                  className={`w-full h-12 rounded-lg font-semibold transition-all ${
                    tier.highlighted
                      ? 'bg-brand-teal hover:bg-brand-cyan text-white shadow-lg'
                      : 'border-2 border-brand-teal text-brand-teal hover:bg-brand-teal/10'
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* What You Can Create */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '📚', title: '4 Storyboards', desc: 'With Starter Plan' },
            { icon: '🎯', title: '12 Storyboards', desc: 'With Growth Plan' },
            { icon: '🚀', title: '20 Storyboards', desc: 'With Scale Plan' },
          ].map((item) => (
            <div key={item.title} className="bg-light-card dark:bg-dark-card p-6 rounded-lg border border-light-border dark:border-dark-border text-center">
              <div className="text-4xl mb-2">{item.icon}</div>
              <h4 className="font-semibold mb-1 text-light-text dark:text-dark-text">
                {item.title}
              </h4>
              <p className="text-sm text-light-muted dark:text-dark-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
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
                a: 'On average, a complete storyboard with 6-8 modules costs approximately 250 credits.',
              },
              {
                q: 'Do you offer discounts for bulk purchases?',
                a: 'Yes! Our Growth and Scale plans offer 10% and 15% savings respectively compared to the Starter plan.',
              },
              {
                q: 'Can I share credits with my team?',
                a: 'Currently, credits are tied to individual accounts. For team plans, please contact our support team.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and PayPal. Enterprise customers can also pay via invoice.',
              },
              {
                q: 'How long do my credits last?',
                a: 'Unused credits expire after 365 days from the date of purchase. Make sure to use them within this period!',
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
        <div className="max-w-3xl mx-auto mt-12">
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
                  <strong>Payment Processing:</strong> Payments are processed securely via Razorpay (India) 
                  or Stripe (International). We do not store your card details.
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
    </div>
  )
}
