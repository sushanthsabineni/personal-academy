'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Coins, TrendingUp, TrendingDown, ShoppingCart, Gift, 
  Calendar, ArrowRight, Download, Filter, Search, FileText, X 
} from '@/lib/icons'

export default function CreditsPage() {
  const router = useRouter()
  const [filterType, setFilterType] = useState<'all' | 'earned' | 'spent' | 'purchased'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null)

  // Mock data
  const currentBalance = 1000
  const totalEarned = 8500
  const totalSpent = 6200
  const totalPurchased = 15000

  const transactions = [
    {
      id: 1,
      type: 'purchase',
      amount: 5000,
      description: 'Scale Plan Purchase',
      date: '2024-10-20',
      status: 'completed',
      icon: ShoppingCart,
      color: 'blue',
      invoiceNumber: 'INV-2024-001',
      price: 49.00,
    },
    {
      id: 2,
      type: 'spent',
      amount: -250,
      description: 'Course Storyboard: Introduction to Python',
      date: '2024-10-19',
      status: 'completed',
      icon: TrendingDown,
      color: 'red',
    },
    {
      id: 3,
      type: 'earned',
      amount: 1000,
      description: 'Referral bonus from Sarah Khan',
      date: '2024-10-18',
      status: 'completed',
      icon: Gift,
      color: 'green',
    },
    {
      id: 4,
      type: 'spent',
      amount: -250,
      description: 'Course Storyboard: Advanced JavaScript',
      date: '2024-10-17',
      status: 'completed',
      icon: TrendingDown,
      color: 'red',
    },
    {
      id: 5,
      type: 'purchase',
      amount: 3000,
      description: 'Growth Plan Purchase',
      date: '2024-10-15',
      status: 'completed',
      icon: ShoppingCart,
      color: 'blue',
      invoiceNumber: 'INV-2024-002',
      price: 29.00,
    },
    {
      id: 6,
      type: 'earned',
      amount: 500,
      description: 'Referral bonus from Arjun Patel',
      date: '2024-10-14',
      status: 'completed',
      icon: Gift,
      color: 'green',
    },
    {
      id: 7,
      type: 'spent',
      amount: -250,
      description: 'Course Storyboard: React Fundamentals',
      date: '2024-10-12',
      status: 'completed',
      icon: TrendingDown,
      color: 'red',
    },
  ]

  const usageStats = [
    { label: 'Storyboards Created', value: 24, sublabel: 'Lifetime' },
    { label: 'Average per Storyboard', value: '258 credits', sublabel: 'Avg cost' },
    { label: 'Total Modules', value: 156, sublabel: 'Generated' },
    { label: 'Total Slides', value: 1248, sublabel: 'Generated' },
  ]

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType =
      filterType === 'all' ||
      transaction.type === filterType
    const matchesSearch =
      searchTerm === '' ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
      case 'earned':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      case 'spent':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  const generateInvoicePDF = async (transaction: typeof transactions[0]) => {
    // Dynamically import jsPDF only when needed
    const jsPDF = (await import('jspdf')).default
    const doc = new jsPDF()
    
    // Set font sizes
    const titleSize = 24
    const headingSize = 14
    const normalSize = 11
    const smallSize = 9
    
    // Colors
    const primaryColor: [number, number, number] = [20, 184, 166] // brand-teal
    const darkGray: [number, number, number] = [55, 65, 81]
    const lightGray: [number, number, number] = [107, 114, 128]
    
    let yPos = 20
    
    // Company Header
    doc.setFontSize(titleSize)
    doc.setTextColor(...primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text('PERSONAL ACADEMY', 105, yPos, { align: 'center' })
    
    yPos += 8
    doc.setFontSize(smallSize)
    doc.setTextColor(...lightGray)
    doc.setFont('helvetica', 'normal')
    doc.text('AI-Powered Course Creation Platform', 105, yPos, { align: 'center' })
    
    yPos += 4
    doc.text('contact@personalacademy.app', 105, yPos, { align: 'center' })
    
    // Horizontal line
    yPos += 8
    doc.setDrawColor(...lightGray)
    doc.line(20, yPos, 190, yPos)
    
    // Invoice title
    yPos += 12
    doc.setFontSize(headingSize)
    doc.setTextColor(...darkGray)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 20, yPos)
    
    // Invoice details (right side)
    doc.setFontSize(normalSize)
    doc.setFont('helvetica', 'normal')
    doc.text('Invoice Number:', 130, yPos)
    doc.setFont('helvetica', 'bold')
    doc.text(transaction.invoiceNumber || 'N/A', 165, yPos)
    
    yPos += 7
    doc.setFont('helvetica', 'normal')
    doc.text('Date:', 130, yPos)
    doc.setFont('helvetica', 'bold')
    doc.text(new Date(transaction.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }), 165, yPos)
    
    yPos += 7
    doc.setFont('helvetica', 'normal')
    doc.text('Status:', 130, yPos)
    doc.setTextColor(34, 197, 94) // green
    doc.setFont('helvetica', 'bold')
    doc.text('PAID', 165, yPos)
    
    // Bill to section
    yPos += 15
    doc.setTextColor(...lightGray)
    doc.setFontSize(smallSize)
    doc.setFont('helvetica', 'bold')
    doc.text('BILL TO:', 20, yPos)
    
    yPos += 6
    doc.setTextColor(...darkGray)
    doc.setFontSize(normalSize)
    doc.setFont('helvetica', 'bold')
    doc.text('John Doe', 20, yPos)
    
    yPos += 6
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...lightGray)
    doc.text('john@example.com', 20, yPos)
    
    yPos += 5
    doc.text('San Francisco, CA', 20, yPos)
    
    // Items table
    yPos += 15
    
    // Table header
    doc.setFillColor(249, 250, 251)
    doc.rect(20, yPos, 170, 10, 'F')
    doc.setDrawColor(...lightGray)
    doc.rect(20, yPos, 170, 10, 'S')
    
    doc.setFontSize(normalSize)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkGray)
    doc.text('Description', 25, yPos + 7)
    doc.text('Credits', 130, yPos + 7, { align: 'right' })
    doc.text('Amount', 185, yPos + 7, { align: 'right' })
    
    // Table row
    yPos += 10
    const rowHeight = 12
    doc.rect(20, yPos, 170, rowHeight, 'S')
    
    doc.setFont('helvetica', 'normal')
    doc.text(transaction.description, 25, yPos + 8)
    doc.text(transaction.amount.toLocaleString(), 130, yPos + 8, { align: 'right' })
    doc.text(`$${transaction.price?.toFixed(2)}`, 185, yPos + 8, { align: 'right' })
    
    // Total row
    yPos += rowHeight
    doc.setFillColor(249, 250, 251)
    doc.rect(20, yPos, 170, 12, 'F')
    doc.setDrawColor(...darkGray)
    doc.setLineWidth(0.5)
    doc.rect(20, yPos, 170, 12, 'S')
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkGray)
    doc.text('TOTAL:', 130, yPos + 8, { align: 'right' })
    doc.setFontSize(headingSize)
    doc.setTextColor(...primaryColor)
    doc.text(`$${transaction.price?.toFixed(2)}`, 185, yPos + 8, { align: 'right' })
    
    // Footer note
    yPos += 25
    doc.setFontSize(smallSize)
    doc.setTextColor(...lightGray)
    doc.setFont('helvetica', 'italic')
    const footerText = 'Thank you for your purchase! If you have any questions, please contact our support team.'
    const splitFooter = doc.splitTextToSize(footerText, 170)
    doc.text(splitFooter, 105, yPos, { align: 'center' })
    
    // Save the PDF
    doc.save(`${transaction.invoiceNumber}.pdf`)
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-display font-bold mb-3 text-light-text dark:text-dark-text">
            Credits & Purchases 💰
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
                ≈ {Math.floor(currentBalance / 250)} storyboards remaining
              </p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                  {totalEarned.toLocaleString()}
                </div>
                <div className="text-sm text-light-muted dark:text-dark-muted">Total Earned</div>
              </div>
            </div>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              From referrals and bonuses
            </p>
          </div>

          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ShoppingCart size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                  {totalPurchased.toLocaleString()}
                </div>
                <div className="text-sm text-light-muted dark:text-dark-muted">Total Purchased</div>
              </div>
            </div>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              Lifetime purchases
            </p>
          </div>

          <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                  {totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-light-muted dark:text-dark-muted">Total Spent</div>
              </div>
            </div>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              On storyboard generation
            </p>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border mb-8">
          <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
            Usage Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {usageStats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold text-brand-teal mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-light-muted dark:text-dark-muted">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
              Transaction History
            </h2>
            <button
              onClick={() => {
                // Export functionality
                alert('Exporting transaction history...')
              }}
              className="px-4 py-2 bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border rounded-lg hover:border-brand-teal transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 bg-light-bg dark:bg-dark-bg rounded-lg px-3 py-2 flex-1 min-w-[200px]">
              <Search size={16} className="text-light-muted dark:text-dark-muted" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-light-muted dark:text-dark-muted" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'earned' | 'spent' | 'purchased')}
                className="px-4 py-2 bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border rounded-lg text-sm text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
              >
                <option value="all">All Types</option>
                <option value="purchase">Purchases</option>
                <option value="earned">Earned</option>
                <option value="spent">Spent</option>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Coins size={48} className="mx-auto text-light-muted dark:text-dark-muted mb-3" />
                <p className="text-light-muted dark:text-dark-muted">
                  No transactions found
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-light-border dark:border-dark-border hover:border-brand-teal transition-all"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(transaction.type)}`}>
                    <transaction.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-light-text dark:text-dark-text mb-1">
                      {transaction.description}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted">
                      <Calendar size={12} />
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className={`text-right flex items-center gap-3`}>
                    <div>
                      <div className={`text-xl font-bold ${
                        transaction.amount > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-light-muted dark:text-dark-muted capitalize">
                        {transaction.type}
                      </div>
                    </div>
                    {transaction.type === 'purchase' && transaction.invoiceNumber && (
                      <button
                        onClick={() => setSelectedInvoice(transaction.id)}
                        className="px-3 py-2 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                        title="View Invoice"
                      >
                        <FileText size={16} />
                        Invoice
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination placeholder */}
          {filteredTransactions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border text-center">
              <p className="text-sm text-light-muted dark:text-dark-muted">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </div>
          )}
        </div>

        {/* Invoice Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {(() => {
                const invoice = transactions.find(t => t.id === selectedInvoice)
                if (!invoice) return null

                return (
                  <>
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
                        Invoice Details
                      </h2>
                      <button
                        onClick={() => setSelectedInvoice(null)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <X size={24} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Invoice Content */}
                    <div className="p-6 space-y-6">
                      {/* Company Header */}
                      <div className="text-center pb-6 border-b border-gray-200 dark:border-slate-700">
                        <h1 className="text-3xl font-bold text-brand-teal mb-2">PERSONAL ACADEMY</h1>
                        <p className="text-sm text-light-muted dark:text-dark-muted">
                          AI-Powered Course Creation Platform
                        </p>
                        <p className="text-sm text-light-muted dark:text-dark-muted">
                          contact@personalacademy.app
                        </p>
                      </div>

                      {/* Invoice Info */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-semibold text-light-muted dark:text-dark-muted mb-2">
                            INVOICE TO:
                          </h3>
                          <p className="font-semibold text-light-text dark:text-dark-text">John Doe</p>
                          <p className="text-sm text-light-muted dark:text-dark-muted">john@example.com</p>
                          <p className="text-sm text-light-muted dark:text-dark-muted">San Francisco, CA</p>
                        </div>
                        <div className="text-right">
                          <div className="mb-4">
                            <p className="text-sm text-light-muted dark:text-dark-muted">Invoice Number</p>
                            <p className="font-bold text-lg text-light-text dark:text-dark-text">{invoice.invoiceNumber}</p>
                          </div>
                          <div className="mb-4">
                            <p className="text-sm text-light-muted dark:text-dark-muted">Date</p>
                            <p className="font-semibold text-light-text dark:text-dark-text">
                              {new Date(invoice.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-light-muted dark:text-dark-muted">Status</p>
                            <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                              Paid
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-slate-900">
                            <tr>
                              <th className="text-left px-4 py-3 text-sm font-semibold text-light-text dark:text-dark-text">
                                Description
                              </th>
                              <th className="text-right px-4 py-3 text-sm font-semibold text-light-text dark:text-dark-text">
                                Credits
                              </th>
                              <th className="text-right px-4 py-3 text-sm font-semibold text-light-text dark:text-dark-text">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t border-gray-200 dark:border-slate-700">
                              <td className="px-4 py-4 text-light-text dark:text-dark-text">
                                {invoice.description}
                              </td>
                              <td className="px-4 py-4 text-right text-light-text dark:text-dark-text">
                                {invoice.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-4 text-right font-semibold text-light-text dark:text-dark-text">
                                ${invoice.price?.toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                          <tfoot className="border-t-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900">
                            <tr>
                              <td colSpan={2} className="px-4 py-4 text-right font-bold text-light-text dark:text-dark-text">
                                Total:
                              </td>
                              <td className="px-4 py-4 text-right font-bold text-xl text-brand-teal">
                                ${invoice.price?.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Footer Note */}
                      <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                        <p className="text-sm text-light-muted dark:text-dark-muted text-center">
                          Thank you for your purchase! If you have any questions, please contact our support team.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => generateInvoicePDF(invoice)}
                          className="flex-1 px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={20} />
                          Download Invoice
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="flex-1 px-6 py-3 bg-light-bg dark:bg-dark-bg border-2 border-brand-teal text-brand-teal rounded-lg font-semibold hover:bg-brand-teal/10 transition-all"
                        >
                          Print Invoice
                        </button>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
