'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { 
  getAllExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense, 
  getExpensesSummaryByCategory,
  getCurrentMonthTotalExpenses,
  type Expense,
  type ExpenseCategory 
} from '@/lib/expenses'
import { formatINR } from '@/lib/adminConfig'
import { DollarSign, Plus, Edit2, Trash2, Filter, X } from '@/lib/icons'

export default function ExpensesPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<Record<ExpenseCategory, number>>({} as Record<ExpenseCategory, number>)
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'All'>('All')

  const loadExpenses = useCallback(() => {
    const allExpenses = getAllExpenses()
    setExpenses(allExpenses)
    setSummary(getExpensesSummaryByCategory())
    setMonthlyTotal(getCurrentMonthTotalExpenses())
  }, [])

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login')
      return
    }
    loadExpenses()
  }, [router, loadExpenses])

  const categories: ExpenseCategory[] = [
    'AI Credits',
    'Tools & Subscriptions',
    'Marketing',
    'Development',
    'Infrastructure',
    'Other'
  ]

  const filteredExpenses = filterCategory === 'All' 
    ? expenses 
    : expenses.filter(e => e.category === filterCategory)

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    addExpense(expenseData)
    loadExpenses()
    setShowAddModal(false)
  }

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    updateExpense(id, updates)
    loadExpenses()
    setEditingExpense(null)
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(id)
      loadExpenses()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/admin/settings')}
              className="text-gray-400 hover:text-white transition"
            >
              ← Back to Settings
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Expense Management</h1>
          </div>
          <p className="text-gray-400">
            Track all platform expenses including AI credits, tools, marketing, and development costs
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl p-6 border border-green-700/50">
            <p className="text-sm text-gray-300 mb-2">Total Expenses (All Time)</p>
            <p className="text-3xl font-bold text-white">
              {formatINR(Object.values(summary).reduce((sum, val) => sum + val, 0))}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-700/50">
            <p className="text-sm text-gray-300 mb-2">Current Month Expenses</p>
            <p className="text-3xl font-bold text-white">
              {formatINR(monthlyTotal)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-700/50">
            <p className="text-sm text-gray-300 mb-2">Total Entries</p>
            <p className="text-3xl font-bold text-white">{expenses.length}</p>
          </div>
        </div>

        {/* Category Summary */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Expenses by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <div key={category} className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">{category}</p>
                <p className="text-lg font-bold text-white">
                  {formatINR(summary[category] || 0)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter and Expenses List */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">All Expenses</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'All')}
                className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-gray-400 font-medium pb-3">Date</th>
                  <th className="text-left text-gray-400 font-medium pb-3">Category</th>
                  <th className="text-left text-gray-400 font-medium pb-3">Description</th>
                  <th className="text-right text-gray-400 font-medium pb-3">Amount</th>
                  <th className="text-center text-gray-400 font-medium pb-3">Recurring</th>
                  <th className="text-right text-gray-400 font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-4 text-white">
                      {new Date(expense.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-900/50 text-purple-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-4 text-white">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        {expense.notes && (
                          <p className="text-sm text-gray-400">{expense.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right text-white font-semibold">
                      {formatINR(expense.amount)}
                    </td>
                    <td className="py-4 text-center">
                      {expense.isRecurring ? (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-900/50 text-blue-300">
                          {expense.recurringPeriod}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">One-time</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredExpenses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No expenses found in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingExpense) && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => {
            setShowAddModal(false)
            setEditingExpense(null)
          }}
          onSave={(data) => {
            if (editingExpense) {
              handleUpdateExpense(editingExpense.id, data)
            } else {
              handleAddExpense(data)
            }
          }}
          categories={categories}
        />
      )}
    </div>
  )
}

// Expense Modal Component
function ExpenseModal({
  expense,
  onClose,
  onSave,
  categories
}: {
  expense: Expense | null
  onClose: () => void
  onSave: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void
  categories: ExpenseCategory[]
}) {
  const [formData, setFormData] = useState({
    date: expense?.date || new Date().toISOString().split('T')[0],
    category: expense?.category || 'AI Credits' as ExpenseCategory,
    description: expense?.description || '',
    amount: expense?.amount || 0,
    isRecurring: expense?.isRecurring || false,
    recurringPeriod: expense?.recurringPeriod || 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    notes: expense?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {expense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
              placeholder="e.g., AWS Hosting Costs"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700"
            />
            <label htmlFor="recurring" className="text-gray-300">
              This is a recurring expense
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Recurring Period
              </label>
              <select
                value={formData.recurringPeriod}
                onChange={(e) => setFormData({ ...formData, recurringPeriod: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
              rows={3}
              placeholder="Additional details..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition"
            >
              {expense ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
