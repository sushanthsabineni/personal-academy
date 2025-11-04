'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, adminLogout } from '@/lib/adminAuth'
import {
  getAdminActions,
  getUserActivityLogs,
  type AdminAction,
  type UserActivityLog
} from '@/lib/adminSystem'
import {
  Search,
  Filter,
  Download,
  LogOut,
  Shield,
  User,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from '@/lib/icons'

export default function AdminLogsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin')
  const [adminActions, setAdminActions] = useState<AdminAction[]>([])
  const [userActivities, setUserActivities] = useState<UserActivityLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('7d')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const adminStatus = await isAdmin()
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      setLoading(true)
      const [adminData, userData] = await Promise.all([
        getAdminActions(100),
        getUserActivityLogs('', 100)
      ])

      setAdminActions(adminData)
      setUserActivities(userData)
      setMounted(true)
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  const handleExport = () => {
    const data = activeTab === 'admin' ? adminActions : userActivities
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'Details', 'IP Address'].join(','),
      ...data.map(item => [
        new Date(item.created_at).toISOString(),
        activeTab === 'admin' ? item.action : item.action,
        activeTab === 'admin' ? (item as AdminAction).admin_email || 'System' : (item as UserActivityLog).user_email || 'Unknown',
        activeTab === 'admin' ? JSON.stringify((item as AdminAction).details || {}) : JSON.stringify((item as UserActivityLog).details || {}),
        item.ip_address || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredAdminActions = adminActions.filter(action => {
    const matchesSearch = !searchQuery ||
      action.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (action.admin_email && action.admin_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      JSON.stringify(action.details).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAction = actionFilter === 'all' || action.action === actionFilter

    const actionDate = new Date(action.created_at)
    const now = new Date()
    const daysDiff = (now.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24)
    const matchesDate = dateFilter === 'all' ||
      (dateFilter === '1d' && daysDiff <= 1) ||
      (dateFilter === '7d' && daysDiff <= 7) ||
      (dateFilter === '30d' && daysDiff <= 30)

    return matchesSearch && matchesAction && matchesDate
  })

  const filteredUserActivities = userActivities.filter(activity => {
    const matchesSearch = !searchQuery ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.user_email && activity.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      JSON.stringify(activity.details).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAction = actionFilter === 'all' || activity.action === actionFilter

    const activityDate = new Date(activity.created_at)
    const now = new Date()
    const daysDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
    const matchesDate = dateFilter === 'all' ||
      (dateFilter === '1d' && daysDiff <= 1) ||
      (dateFilter === '7d' && daysDiff <= 7) ||
      (dateFilter === '30d' && daysDiff <= 30)

    return matchesSearch && matchesAction && matchesDate
  })

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('add')) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (action.includes('delete') || action.includes('remove')) return <XCircle className="w-4 h-4 text-red-500" />
    if (action.includes('update') || action.includes('edit')) return <Activity className="w-4 h-4 text-blue-500" />
    if (action.includes('suspend') || action.includes('ban')) return <AlertTriangle className="w-4 h-4 text-orange-500" />
    return <Shield className="w-4 h-4 text-gray-500" />
  }

  const getUniqueActions = (data: (AdminAction | UserActivityLog)[]) => {
    const actions = data.map(item => item.action)
    return ['all', ...Array.from(new Set(actions))]
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading audit logs...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
            <p className="text-sm text-gray-400">Monitor admin actions and user activities</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin Actions ({adminActions.length})
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'user'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            User Activities ({userActivities.length})
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border-2 border-slate-700 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-11 pl-9 pr-4 rounded-lg border-2 border-slate-700 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none appearance-none"
              >
                <option value="all">All Actions</option>
                {getUniqueActions(activeTab === 'admin' ? adminActions : userActivities)
                  .filter(action => action !== 'all')
                  .map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-11 pl-9 pr-4 rounded-lg border-2 border-slate-700 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none appearance-none"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Timestamp</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Action</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">
                    {activeTab === 'admin' ? 'Admin' : 'User'}
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Details</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'admin' ? filteredAdminActions : filteredUserActivities).map((item, index) => (
                  <tr key={index} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <div>
                          <div>{new Date(item.created_at).toLocaleDateString()}</div>
                          <div className="text-xs">{new Date(item.created_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {getActionIcon(item.action)}
                        <span className="text-white font-medium">{item.action}</span>
                      </div>
                    </td>

                    {/* User/Admin */}
                    <td className="py-4 px-6">
                      <div className="text-gray-400 text-sm">
                        {activeTab === 'admin'
                          ? ((item as AdminAction).admin_email || 'System')
                          : ((item as UserActivityLog).user_email || 'Unknown')
                        }
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-4 px-6">
                      {item.details && Object.keys(item.details).length > 0 ? (
                        <details className="group">
                          <summary className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs text-gray-400 bg-slate-900 p-2 rounded overflow-x-auto max-w-md">
                            {JSON.stringify(item.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>

                    {/* IP Address */}
                    <td className="py-4 px-6">
                      <span className="text-gray-400 text-sm font-mono">
                        {item.ip_address || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(activeTab === 'admin' ? filteredAdminActions : filteredUserActivities).length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {loading ? 'Loading logs...' : 'No logs found matching your filters.'}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Total Actions</h3>
            <p className="text-2xl font-bold text-white">
              {activeTab === 'admin' ? adminActions.length : userActivities.length}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Filtered Results</h3>
            <p className="text-2xl font-bold text-white">
              {activeTab === 'admin' ? filteredAdminActions.length : filteredUserActivities.length}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Unique Actions</h3>
            <p className="text-2xl font-bold text-white">
              {getUniqueActions(activeTab === 'admin' ? adminActions : userActivities).length - 1}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Last Activity</h3>
            <p className="text-sm text-gray-400">
              {activeTab === 'admin' && adminActions.length > 0
                ? new Date(adminActions[0].created_at).toLocaleString()
                : activeTab === 'user' && userActivities.length > 0
                ? new Date(userActivities[0].created_at).toLocaleString()
                : 'No activity'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}