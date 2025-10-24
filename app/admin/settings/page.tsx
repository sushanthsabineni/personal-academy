'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { getAdminConfig } from '@/lib/adminConfig'
import { Settings, DollarSign, Zap, CreditCard, Globe, Shield } from '@/lib/icons'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [config] = useState(getAdminConfig())

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login')
    }
  }, [router])

  const settingsCards = [
    {
      title: 'Expense Management',
      description: 'Track and manage all platform expenses including AI credits, tools, marketing, and development costs',
      icon: DollarSign,
      href: '/admin/expenses',
      color: 'from-green-600 to-emerald-600',
      iconColor: 'text-green-400',
    },
    {
      title: 'AI Credit Rates',
      description: 'Configure AI credit costs for different course generation sections (Learning Outcomes, Modules, Lessons, etc.)',
      icon: Zap,
      href: '/admin/config/ai-credits',
      color: 'from-yellow-600 to-orange-600',
      iconColor: 'text-yellow-400',
    },
    {
      title: 'Pricing Plans',
      description: 'Manage Free and Premium plan pricing, credits allocation, and feature lists',
      icon: CreditCard,
      href: '/admin/config/pricing',
      color: 'from-purple-600 to-pink-600',
      iconColor: 'text-purple-400',
    },
    {
      title: 'Platform Settings',
      description: 'Configure currency, exchange rates, platform name, support email, and other global settings',
      icon: Globe,
      href: '/admin/config/platform',
      color: 'from-blue-600 to-cyan-600',
      iconColor: 'text-blue-400',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-400 hover:text-white transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
          </div>
          <p className="text-gray-400">
            Manage all platform configurations, expenses, pricing, and AI credit rates
          </p>
        </div>

        {/* Current Configuration Summary */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Current Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Currency</p>
              <p className="text-xl font-bold text-white">
                {config.platformSettings.currencyCode} ({config.platformSettings.currencySymbol})
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Exchange Rate</p>
              <p className="text-xl font-bold text-white">
                1 USD = {config.platformSettings.exchangeRate} INR
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Last Updated</p>
              <p className="text-xl font-bold text-white">
                {new Date(config.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCards.map((card) => {
            const Icon = card.icon
            return (
              <button
                key={card.href}
                onClick={() => router.push(card.href)}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-all group text-left"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {card.description}
                </p>
                <div className="mt-4 flex items-center text-purple-400 text-sm font-semibold">
                  Configure →
                </div>
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/expenses')}
              className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 text-left transition"
            >
              <p className="text-sm text-gray-400 mb-1">Add New</p>
              <p className="text-white font-semibold">Expense Entry</p>
            </button>
            <button
              onClick={() => router.push('/admin/config/ai-credits')}
              className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 text-left transition"
            >
              <p className="text-sm text-gray-400 mb-1">Modify</p>
              <p className="text-white font-semibold">AI Credit Rates</p>
            </button>
            <button
              onClick={() => router.push('/admin/config/pricing')}
              className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 text-left transition"
            >
              <p className="text-sm text-gray-400 mb-1">Update</p>
              <p className="text-white font-semibold">Pricing Plans</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
