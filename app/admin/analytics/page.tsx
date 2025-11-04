'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, adminLogout } from '@/lib/adminAuth'
import { 
  getPlatformMetrics, 
  getDailyRevenue, 
  getCourseStats,
  getAICreditsMetrics 
} from '@/lib/adminData'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BookOpen, 
  Zap,
  Calendar,
  LogOut,
  Download
} from '@/lib/icons'

interface ChartData {
  labels: string[]
  data: number[]
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    totalCourses: 0,
    coursesThisMonth: 0,
    totalCreditsUsed: 0
  })
  const [revenueChart, setRevenueChart] = useState<ChartData>({ labels: [], data: [] })
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const getTimeRangeDays = (range: string): number => {
    switch (range) {
      case '7d':
        return 7
      case '30d':
        return 30
      case '90d':
        return 90
      default:
        return 30
    }
  }

  useEffect(() => {
    const loadData = async () => {
      const adminStatus = await isAdmin()
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      try {
        // Load platform metrics
        const platformData = await getPlatformMetrics()
        const courseData = await getCourseStats()
        const creditsData = await getAICreditsMetrics()

        setMetrics({
          totalUsers: platformData?.totalUsers || 0,
          premiumUsers: platformData?.premiumUsers || 0,
          freeUsers: platformData?.freeUsers || 0,
          totalRevenue: platformData?.lifetimeRevenue || 0,
          revenueThisMonth: platformData?.revenueThisMonth || 0,
          totalCourses: courseData?.totalCourses || 0,
          coursesThisMonth: courseData?.coursesThisMonth || 0,
          totalCreditsUsed: creditsData?.totalCreditsUsed || 0
        })

        // Load revenue chart data
        const days = getTimeRangeDays(timeRange)
        const revenueData = await getDailyRevenue(days)
        setRevenueChart({
          labels: (revenueData || []).map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
          data: (revenueData || []).map(d => d.amount)
        })
      } catch (error) {
        console.error('Error loading analytics data:', error)
        // Set default values on error
        setMetrics({
          totalUsers: 0,
          premiumUsers: 0,
          freeUsers: 0,
          totalRevenue: 0,
          revenueThisMonth: 0,
          totalCourses: 0,
          coursesThisMonth: 0,
          totalCreditsUsed: 0
        })
        setRevenueChart({ labels: [], data: [] })
      }

      setMounted(true)
    }

    loadData()
  }, [router, timeRange])

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  const handleExport = () => {
    const csvContent = [
      ['Metric', 'Value'].join(','),
      ['Total Users', metrics.totalUsers].join(','),
      ['Premium Users', metrics.premiumUsers].join(','),
      ['Free Users', metrics.freeUsers].join(','),
      ['Total Revenue', `$${metrics.totalRevenue.toFixed(2)}`].join(','),
      ['Revenue This Month', `$${metrics.revenueThisMonth.toFixed(2)}`].join(','),
      ['Total Courses', metrics.totalCourses].join(','),
      ['Courses This Month', metrics.coursesThisMonth].join(','),
      ['Total Credits Used', metrics.totalCreditsUsed].join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const calculateChange = (current: number, total: number) => {
    if (total === 0) return 0
    return ((current / total) * 100).toFixed(1)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-sm text-gray-400">Comprehensive platform insights and metrics</p>
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
        {/* Time Range Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 font-medium">Time Range:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === '7d'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === '30d'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === '90d'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              }`}
            >
              Last 90 Days
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                {calculateChange(metrics.freeUsers + metrics.premiumUsers, metrics.totalUsers)}%
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-white mb-2">{metrics.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              {metrics.premiumUsers} Premium · {metrics.freeUsers} Free
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-600/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                {calculateChange(metrics.revenueThisMonth, metrics.totalRevenue)}%
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-white mb-2">${metrics.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              ${metrics.revenueThisMonth.toLocaleString()} this month
            </p>
          </div>

          {/* Total Courses */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-600/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                {calculateChange(metrics.coursesThisMonth, metrics.totalCourses)}%
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Courses</h3>
            <p className="text-3xl font-bold text-white mb-2">{metrics.totalCourses.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              {metrics.coursesThisMonth} created this month
            </p>
          </div>

          {/* AI Credits Used */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-600/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Active
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">AI Credits Used</h3>
            <p className="text-3xl font-bold text-white mb-2">{metrics.totalCreditsUsed.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              Across all users
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Revenue Trend
            </h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {revenueChart.data.length > 0 ? (
                revenueChart.data.map((value, index) => {
                  const maxValue = Math.max(...revenueChart.data, 1)
                  const height = (value / maxValue) * 100
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="relative flex-1 w-full flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t transition-all hover:from-green-500 hover:to-green-300"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 px-2 py-1 rounded text-xs text-white whitespace-nowrap transition-opacity">
                            ${value.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                        {revenueChart.labels[index]}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              User Type Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Donut Chart */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="32"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="32"
                    strokeDasharray={`${(metrics.premiumUsers / metrics.totalUsers) * 502.4} 502.4`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {metrics.totalUsers > 0 ? ((metrics.premiumUsers / metrics.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                  <span className="text-sm text-gray-400">Premium</span>
                </div>
              </div>
              <div className="ml-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <div>
                    <div className="text-white font-medium">{metrics.premiumUsers.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Premium Users</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                  <div>
                    <div className="text-white font-medium">{metrics.freeUsers.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Free Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversion Rate */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Conversion Rate</h3>
            <p className="text-2xl font-bold text-white mb-1">
              {metrics.totalUsers > 0 ? ((metrics.premiumUsers / metrics.totalUsers) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500">Free to Premium</p>
          </div>

          {/* Avg Revenue per User */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">ARPU</h3>
            <p className="text-2xl font-bold text-white mb-1">
              ${metrics.totalUsers > 0 ? (metrics.totalRevenue / metrics.totalUsers).toFixed(2) : 0}
            </p>
            <p className="text-xs text-gray-500">Average Revenue per User</p>
          </div>

          {/* Avg Courses per User */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Engagement</h3>
            <p className="text-2xl font-bold text-white mb-1">
              {metrics.totalUsers > 0 ? (metrics.totalCourses / metrics.totalUsers).toFixed(1) : 0}
            </p>
            <p className="text-xs text-gray-500">Avg Courses per User</p>
          </div>
        </div>
      </div>
    </div>
  )
}
