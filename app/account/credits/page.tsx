'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Gift, 
  Calendar, 
  ArrowRight, 
  Search, 
  FileText, 
  Loader, 
  Download 
} from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  type: 'purchase' | 'earned' | 'spent' | 'refund' | 'bonus' | 'referral'
  description: string
  balance_after: number
  invoice_number: string | null
  created_at: string
  payment_id: string | null
  payment_amount: number | null
  payment_currency: string | null
  metadata: Record<string, unknown>
}

interface CreditsData {
  currentBalance: number
  isPremium: boolean
  userProfile: {
    fullName: string | null
    email: string
  }
  expiryInfo: {
    expiringAmount: number
    daysUntilExpiry: number | null
    nearestExpiry: string | null
  }
  stats: {
    totalEarned: number
    totalSpent: number
    totalPurchased: number
    storyboardsCreated: number
  }
  transactions: Transaction[]
}

export default function CreditsPage() {
  const router = useRouter()
  const [filterType, setFilterType] = useState<'all' | 'earned' | 'spent' | 'purchase'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [creditsData, setCreditsData] = useState<CreditsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch real data from API
  useEffect(() => {
    const fetchCreditsData = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching credits data from API...')
        const response = await fetch('/api/credits/transactions')
        
        console.log('Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          let errorData
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json()
          } else {
            const text = await response.text()
            console.error('Non-JSON response:', text)
            errorData = { error: `Server error: ${response.status}` }
          }
          console.error('API Error:', errorData)
          throw new Error(errorData.error || errorData.details || 'Failed to fetch credits data')
        }

        const data = await response.json()
        console.log('Credits data loaded:', data)
        setCreditsData(data)
      } catch (err) {
        console.error('Error fetching credits:', err)
        setError(err instanceof Error ? err.message : 'Failed to load credits data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCreditsData()
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return ShoppingCart
      case 'earned':
      case 'bonus':
      case 'referral':
        return Gift
      case 'spent':
        return TrendingDown
      case 'refund':
        return TrendingUp
      default:
        return Coins
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
      case 'earned':
      case 'bonus':
      case 'referral':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      case 'spent':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      case 'refund':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  const generateInvoice = async (transaction: Transaction) => {
    // Dynamically import jsPDF
    const jsPDF = (await import('jspdf')).default
    const doc = new jsPDF()

    // Colors
    const brandTeal: [number, number, number] = [20, 184, 166]
    const darkGray: [number, number, number] = [55, 65, 81]
    const lightGray: [number, number, number] = [107, 114, 128]

    let yPos = 20

    // Company Logo & Header - Draw a proper circle with "PA" text
    doc.setFillColor(...brandTeal)
    doc.circle(30, yPos + 5, 8, 'F')
    
    // Add "PA" text inside the circle
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255) // White text
    doc.setFont('helvetica', 'bold')
    doc.text('PA', 30, yPos + 8, { align: 'center', baseline: 'middle' })
    
    doc.setFontSize(24)
    doc.setTextColor(...brandTeal)
    doc.setFont('helvetica', 'bold')
    doc.text('PERSONAL ACADEMY', 45, yPos + 8)

    yPos += 15
    doc.setFontSize(10)
    doc.setTextColor(...lightGray)
    doc.setFont('helvetica', 'normal')
    doc.text('AI-Powered Course Creation Platform', 45, yPos)
    
    yPos += 5
    doc.text('support@personalacademy.app | www.personalacademy.app', 45, yPos)

    // Horizontal line
    yPos += 8
    doc.setDrawColor(...lightGray)
    doc.setLineWidth(0.5)
    doc.line(20, yPos, 190, yPos)

    // INVOICE Title
    yPos += 12
    doc.setFontSize(20)
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 20, yPos)

    // Invoice Details (right aligned)
    const rightCol = 190
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Invoice Date:', rightCol - 60, yPos)
    doc.setFont('helvetica', 'bold')
    doc.text(
      new Date(transaction.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      rightCol,
      yPos,
      { align: 'right' }
    )

    yPos += 7
    doc.setFont('helvetica', 'normal')
    doc.text('Transaction ID:', rightCol - 60, yPos)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(transaction.id.substring(0, 18) + '...', rightCol, yPos, { align: 'right' })

    yPos += 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Status:', rightCol - 60, yPos)
    doc.setTextColor(34, 197, 94) // green
    doc.setFont('helvetica', 'bold')
    doc.text('PAID', rightCol, yPos, { align: 'right' })

    // Bill To Section
    yPos += 15
    doc.setTextColor(...lightGray)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('BILL TO:', 20, yPos)

    yPos += 6
    doc.setTextColor(...darkGray)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    const userName = creditsData?.userProfile?.fullName || creditsData?.userProfile?.email?.split('@')[0] || 'User'
    doc.text(userName, 20, yPos)

    yPos += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...lightGray)
    doc.text(creditsData?.userProfile?.email || 'Personal Academy Platform', 20, yPos)

    // Items Table
    yPos += 15
    
    // Table header - Adjust column widths
    const tableWidth = 170
    const descCol = 25
    const creditsCol = 130
    const amountCol = 175
    
    doc.setFillColor(249, 250, 251)
    doc.rect(20, yPos, tableWidth, 10, 'F')
    doc.setDrawColor(...lightGray)
    doc.rect(20, yPos, tableWidth, 10, 'S')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkGray)
    doc.text('Description', descCol, yPos + 7)
    doc.text('Credits', creditsCol, yPos + 7, { align: 'right' })
    doc.text('Amount', amountCol, yPos + 7, { align: 'right' })

    // Table row
    yPos += 10
    const rowHeight = 12
    doc.rect(20, yPos, tableWidth, rowHeight, 'S')

    doc.setFont('helvetica', 'normal')
    doc.text(transaction.description || 'Credit Purchase', descCol, yPos + 8)
    doc.text(transaction.amount.toLocaleString(), creditsCol, yPos + 8, { align: 'right' })
    
    const amountInCurrency = transaction.payment_amount 
      ? `${transaction.payment_currency === 'INR' ? '₹' : '$'}${transaction.payment_amount.toFixed(2)}`
      : 'N/A'
    doc.setFontSize(9) // Slightly smaller font for amounts to prevent overflow
    doc.text(amountInCurrency, amountCol, yPos + 8, { align: 'right' })

    // Total row
    yPos += rowHeight
    doc.setFillColor(249, 250, 251)
    doc.rect(20, yPos, tableWidth, 12, 'F')
    doc.setDrawColor(...darkGray)
    doc.setLineWidth(0.5)
    doc.rect(20, yPos, tableWidth, 12, 'S')

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkGray)
    doc.setFontSize(11)
    doc.text('TOTAL:', creditsCol, yPos + 8, { align: 'right' })
    doc.setFontSize(13) // Slightly smaller to fit in box
    doc.setTextColor(...brandTeal)
    doc.text(amountInCurrency, amountCol, yPos + 8, { align: 'right' })

    // Footer note
    yPos += 25
    doc.setFontSize(9)
    doc.setTextColor(...lightGray)
    doc.setFont('helvetica', 'italic')
    const footerText = 'Thank you for your purchase! Credits have been added to your account. If you have any questions, please contact our support team at support@personalacademy.app'
    const maxWidth = 170
    const lines = doc.splitTextToSize(footerText, maxWidth)
    doc.text(lines, 105, yPos, { align: 'center' })

    // Terms & Conditions
    yPos += 20
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...darkGray)
    doc.text('Terms & Conditions:', 20, yPos)
    
    yPos += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...lightGray)
    doc.text('• Credits are non-refundable and non-transferable', 20, yPos)
    yPos += 4
    doc.text('• Credits expire 365 days from the date of purchase', 20, yPos)
    yPos += 4
    doc.text('• Valid for use on Personal Academy platform only', 20, yPos)

    // Save PDF
    const fileName = `Personal-Academy-Invoice-${new Date(transaction.created_at).toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  const filteredTransactions = creditsData?.transactions.filter((transaction) => {
    const matchesType =
      filterType === 'all' ||
      (filterType === 'earned' && ['earned', 'bonus', 'referral'].includes(transaction.type)) ||
      transaction.type === filterType
    const matchesSearch =
      searchTerm === '' ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  }) || []

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-3">
              <Loader className="animate-spin text-brand-teal" size={24} />
              <span className="text-light-muted dark:text-dark-muted">Loading credits data...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !creditsData) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-center h-96">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Failed to load credits data'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { currentBalance, isPremium, stats, expiryInfo } = creditsData

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-display font-bold mb-3 text-light-text dark:text-dark-text">
            Credits & Purchases
          </h1>
          <p className="text-xl text-light-muted dark:text-dark-muted">
            Manage your credits, view purchase history, and track usage
          </p>
        </div>

        {/* Current Balance Card */}
        <div className="bg-gradient-to-br from-brand-teal to-brand-cyan rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Current Balance</p>
              <h2 className="text-5xl font-bold mb-2">{currentBalance.toLocaleString()}</h2>
              <p className="text-white/90 text-sm">
                {isPremium ? '✨ Premium User - Unlimited Courses' : `≈ ${Math.floor(currentBalance / 250)} storyboards remaining`}
              </p>
              
              {/* Credits Expiry Warning */}
              {expiryInfo && expiryInfo.expiringAmount > 0 && expiryInfo.daysUntilExpiry !== null && (
                <div className="mt-3 p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <p className="text-sm text-white/95">
                    ⚠️ <span className="font-semibold">{expiryInfo.expiringAmount.toLocaleString()} credits</span> will expire in{' '}
                    <span className="font-bold">{expiryInfo.daysUntilExpiry} {expiryInfo.daysUntilExpiry === 1 ? 'day' : 'days'}</span>
                  </p>
                  {expiryInfo.nearestExpiry && (
                    <p className="text-xs text-white/80 mt-1">
                      Expiry date: {new Date(expiryInfo.nearestExpiry).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => router.push('/account/pricing')}
              className="px-6 py-3 bg-white text-brand-teal rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg flex items-center gap-2"
            >
              Buy More Credits
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                  {stats.totalEarned.toLocaleString()}
                </div>
                <div className="text-xs text-light-muted dark:text-dark-muted">Total Earned</div>
              </div>
            </div>
          </div>

          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ShoppingCart size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                  {stats.totalPurchased.toLocaleString()}
                </div>
                <div className="text-xs text-light-muted dark:text-dark-muted">Total Purchased</div>
              </div>
            </div>
          </div>

          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                  {stats.totalSpent.toLocaleString()}
                </div>
                <div className="text-xs text-light-muted dark:text-dark-muted">Total Spent</div>
              </div>
            </div>
          </div>

          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                  {stats.storyboardsCreated}
                </div>
                <div className="text-xs text-light-muted dark:text-dark-muted">Storyboards Created</div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
              Transaction History
            </h2>
            <div className="flex items-center gap-3">
              {/* Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                <option value="all">All Transactions</option>
                <option value="earned">Earned</option>
                <option value="purchase">Purchased</option>
                <option value="spent">Spent</option>
              </select>

              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-light-muted dark:text-dark-muted">
                <Coins size={48} className="mx-auto mb-4 opacity-30" />
                <p>No transactions found</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type)
                const isPurchase = transaction.type === 'purchase'
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border hover:border-brand-teal/50 transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(transaction.type)}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-light-text dark:text-dark-text">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-light-muted dark:text-dark-muted">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(transaction.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {transaction.invoice_number && (
                            <span className="text-xs bg-light-card dark:bg-dark-card px-2 py-1 rounded">
                              {transaction.invoice_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-xl font-bold ${transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-light-muted dark:text-dark-muted">
                          Balance: {transaction.balance_after.toLocaleString()}
                        </p>
                      </div>
                      
                      {/* Invoice Button for Purchases */}
                      {isPurchase && (
                        <button
                          onClick={() => generateInvoice(transaction)}
                          className="px-3 py-2 bg-brand-teal hover:bg-brand-teal/90 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                          title="Download Invoice"
                        >
                          <Download size={16} />
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
