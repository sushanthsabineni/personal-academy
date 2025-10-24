'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Receipt, Download, Calendar, CreditCard, CheckCircle } from '@/lib/icons'
import { isAuthenticated } from '@/lib/auth'

interface Purchase {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'refunded'
  invoice: string
  credits: number
}

export default function PurchasesPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    // Mock purchase data - replace with actual API call
    setTimeout(() => {
      setPurchases([
        {
          id: 'PUR-2024-001',
          date: '2024-10-20',
          description: 'Pro Plan - Monthly Subscription',
          amount: 49.99,
          currency: 'USD',
          status: 'completed',
          invoice: 'INV-2024-001.pdf',
          credits: 500
        },
        {
          id: 'PUR-2024-002',
          date: '2024-10-15',
          description: 'Additional Credits Pack - 200 Credits',
          amount: 19.99,
          currency: 'USD',
          status: 'completed',
          invoice: 'INV-2024-002.pdf',
          credits: 200
        },
        {
          id: 'PUR-2024-003',
          date: '2024-09-20',
          description: 'Pro Plan - Monthly Subscription',
          amount: 49.99,
          currency: 'USD',
          status: 'completed',
          invoice: 'INV-2024-003.pdf',
          credits: 500
        }
      ])
      setLoading(false)
    }, 500)
  }, [router])

  const getStatusColor = (status: Purchase['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'refunded':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: Purchase['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownloadInvoice = (invoice: string) => {
    // Implement invoice download logic
    // TODO: Add backend integration for invoice download
    alert('Invoice download will be implemented with backend integration')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading purchases...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-teal dark:hover:text-brand-teal mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Purchase History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your transaction history
              </p>
            </div>
            <Receipt className="h-12 w-12 text-brand-teal" />
          </div>
        </div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No purchases yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your purchase history will appear here
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="px-6 py-3 bg-brand-teal text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              View Plans
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Purchase Info */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {purchase.description}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                        {getStatusText(purchase.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{formatDate(purchase.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard size={16} />
                        <span>Order #{purchase.id}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle size={16} />
                        <span>{purchase.credits} credits</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      ${purchase.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleDownloadInvoice(purchase.invoice)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Download size={16} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Card */}
        {purchases.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-brand-teal to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Purchase Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm opacity-90 mb-1">Total Spent</div>
                <div className="text-2xl font-bold">
                  ${purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Total Purchases</div>
                <div className="text-2xl font-bold">{purchases.length}</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-1">Credits Purchased</div>
                <div className="text-2xl font-bold">
                  {purchases.reduce((sum, p) => sum + p.credits, 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
