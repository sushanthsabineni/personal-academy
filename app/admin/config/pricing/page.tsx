'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { getPricingPlans, updatePricingPlans, formatINR, type PricingPlan } from '@/lib/adminConfig'
import { CreditCard, Save, Plus, Trash2, Check } from '@/lib/icons'

export default function PricingConfigPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<PricingPlan[]>(getPricingPlans())
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [editingFeature, setEditingFeature] = useState<{ planId: string; index: number } | null>(null)

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login')
    }
  }, [router])

  const handlePlanChange = (planId: string, field: keyof PricingPlan, value: unknown) => {
    setPlans(prev =>
      prev.map(plan =>
        plan.id === planId ? { ...plan, [field]: value } : plan
      )
    )
    setHasChanges(true)
  }

  const handleAddFeature = (planId: string) => {
    setPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? { ...plan, features: [...plan.features, 'New feature'] }
          : plan
      )
    )
    setHasChanges(true)
  }

  const handleUpdateFeature = (planId: string, index: number, value: string) => {
    setPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? {
              ...plan,
              features: plan.features.map((f, i) => (i === index ? value : f)),
            }
          : plan
      )
    )
    setHasChanges(true)
  }

  const handleDeleteFeature = (planId: string, index: number) => {
    setPlans(prev =>
      prev.map(plan =>
        plan.id === planId
          ? { ...plan, features: plan.features.filter((_, i) => i !== index) }
          : plan
      )
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    updatePricingPlans(plans)
    setHasChanges(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleReset = () => {
    setPlans(getPricingPlans())
    setHasChanges(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/admin/settings')}
              className="text-gray-400 hover:text-white transition"
            >
              ← Back to Settings
            </button>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="text-gray-400 hover:text-white transition"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  hasChanges
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-slate-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Pricing Plans Configuration</h1>
          </div>
          <p className="text-gray-400">
            Manage your Free and Premium plan pricing, credits allocation, and feature lists
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-900/50 border border-green-700 rounded-lg p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-green-300 font-medium">Pricing plans updated successfully!</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-slate-800/50 rounded-xl p-6 border ${
                plan.isPopular ? 'border-purple-500' : 'border-slate-700'
              } relative`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => handlePlanChange(plan.id, 'name', e.target.value)}
                  className="w-full bg-slate-700 text-white text-xl font-bold rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Price and Credits */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={plan.price}
                    onChange={(e) =>
                      handlePlanChange(plan.id, 'price', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formatINR(plan.price)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    AI Credits
                  </label>
                  <input
                    type="number"
                    value={plan.credits}
                    onChange={(e) =>
                      handlePlanChange(plan.id, 'credits', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Popular Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id={`popular-${plan.id}`}
                  checked={plan.isPopular || false}
                  onChange={(e) => handlePlanChange(plan.id, 'isPopular', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                />
                <label htmlFor={`popular-${plan.id}`} className="text-sm text-gray-300">
                  Mark as popular plan
                </label>
              </div>

              {/* Features */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-400">Features</label>
                  <button
                    onClick={() => handleAddFeature(plan.id)}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {editingFeature?.planId === plan.id &&
                      editingFeature?.index === index ? (
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            handleUpdateFeature(plan.id, index, e.target.value)
                          }
                          onBlur={() => setEditingFeature(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingFeature(null)
                          }}
                          className="flex-1 bg-slate-700 text-white rounded px-2 py-1 text-sm border border-purple-500 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <p
                          onClick={() => setEditingFeature({ planId: plan.id, index })}
                          className="flex-1 text-gray-300 text-sm cursor-pointer hover:text-white"
                        >
                          {feature}
                        </p>
                      )}
                      <button
                        onClick={() => handleDeleteFeature(plan.id, index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan Preview */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-3xl font-bold text-purple-400 my-2">
                    {formatINR(plan.price)}
                    {plan.price > 0 && <span className="text-sm text-gray-400">/month</span>}
                  </p>
                  <p className="text-sm text-gray-400 mb-3">{plan.credits} AI Credits</p>
                  <div className="space-y-1">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <p key={i} className="text-xs text-gray-400 flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-400" />
                        {f}
                      </p>
                    ))}
                    {plan.features.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{plan.features.length - 3} more...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Information Box */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            Pricing Configuration Tips
          </h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• All prices are in INR (Indian Rupees) - ₹ symbol</li>
            <li>• Free plan should always have price = 0</li>
            <li>• Premium plan credits should be significantly higher than Free</li>
            <li>• Mark one plan as &quot;Popular&quot; to highlight it to users</li>
            <li>• Feature lists appear on the pricing page - be clear and concise</li>
            <li>• Click on any feature to edit it inline</li>
            <li>• Changes take effect immediately after saving</li>
          </ul>
        </div>

        {/* Warning if unsaved changes */}
        {hasChanges && (
          <div className="mt-6 bg-orange-900/20 border border-orange-700/50 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-orange-300 font-medium">You have unsaved changes</p>
              <p className="text-gray-400 text-sm mt-1">
                Click &quot;Save Changes&quot; to update the pricing plans shown to users
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
