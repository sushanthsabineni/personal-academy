'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, adminLogout, getAdminUser, type AdminUser } from '@/lib/adminAuth'
import { 
  getPlatformMetrics, 
  getCourseStats, 
  getDailyRevenue,
  getAllUsers,
  getFinancialMetrics,
  getAICreditsMetrics,
  type PlatformMetrics,
  type CourseStats,
  type DailyRevenue,
  type UserProfile,
  type FinancialMetrics,
  type AICreditsMetrics
} from '@/lib/adminData'
import { formatINR } from '@/lib/adminConfig'
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  LogOut,
  UserCheck,
  FileText,
  Calendar,
  Crown,
  Activity,
  Settings
} from '@/lib/icons'

export default function AdminDashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null)
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null)
  const [revenueData, setRevenueData] = useState<DailyRevenue[]>([])
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null)
  const [aiMetrics, setAIMetrics] = useState<AICreditsMetrics | null>(null)

  useEffect(() => {
    // Check admin auth
    if (!isAdmin()) {
      router.push('/admin/login')
      return
    }

    const admin = getAdminUser()
    if (!admin) {
      router.push('/admin/login')
      return
    }

    setAdminUser(admin)
    
    // Load data
    setMetrics(getPlatformMetrics())
    setCourseStats(getCourseStats())
    setRevenueData(getDailyRevenue(7))
    setFinancialMetrics(getFinancialMetrics())
    setAIMetrics(getAICreditsMetrics())
    
    const users = getAllUsers()
    const recent = users.sort((a, b) => 
      new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime()
    ).slice(0, 5)
    setRecentUsers(recent)
    
    setMounted(true)
  }, [router])

  const handleLogout = () => {
    adminLogout()
    router.push('/admin/login')
  }

  if (!mounted || !adminUser || !metrics || !courseStats || !financialMetrics || !aiMetrics) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  const totalRevenueThisWeek = revenueData.reduce((sum, day) => sum + day.amount, 0)

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome back, {adminUser.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/settings')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
            >
              Manage Users
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
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-green-400 font-medium">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{metrics.totalUsers}</h3>
            <p className="text-sm text-gray-400">Total Users</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-gray-400">Free: {metrics.freeUsers}</span>
              <span className="text-gray-600">|</span>
              <span className="text-purple-400">Premium: {metrics.premiumUsers}</span>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{courseStats.totalCourses}</h3>
            <p className="text-sm text-gray-400">Total Courses</p>
            <div className="mt-3 text-xs text-gray-400">
              +{courseStats.coursesThisWeek} this week
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs text-purple-400 font-medium">Revenue</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{formatINR(metrics.revenueThisMonth)}</h3>
            <p className="text-sm text-gray-400">This Month</p>
            <div className="mt-3 text-xs text-gray-400">
              Total: {formatINR(metrics.totalRevenue)}
            </div>
          </div>

          {/* Active Today */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-400" />
              </div>
              <Calendar className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{metrics.activeUsersToday}</h3>
            <p className="text-sm text-gray-400">Active Today</p>
            <div className="mt-3 text-xs text-gray-400">
              {Math.round((metrics.activeUsersToday / metrics.totalUsers) * 100)}% of total
            </div>
          </div>
        </div>

        {/* Financial Overview Section */}
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-700/50 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-purple-400" />
            Financial Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Net Profit */}
            <div className="bg-slate-800/80 rounded-lg p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Net Profit (Monthly)</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {formatINR(financialMetrics.netProfit)}
              </h3>
              <p className="text-xs text-green-400">
                {financialMetrics.profitMargin.toFixed(1)}% margin
              </p>
            </div>

            {/* Total Revenue */}
            <div className="bg-slate-800/80 rounded-lg p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Lifetime Revenue</span>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {formatINR(financialMetrics.totalRevenue)}
              </h3>
              <p className="text-xs text-blue-400">
                MRR: {formatINR(financialMetrics.monthlyRecurringRevenue)}
              </p>
            </div>

            {/* Total Expenses */}
            <div className="bg-slate-800/80 rounded-lg p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Total Expenses</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {formatINR(financialMetrics.totalExpenses)}
              </h3>
              <p className="text-xs text-orange-400">
                AI: {formatINR(financialMetrics.aiCreditsSpent)} | Infra: {formatINR(financialMetrics.infrastructureCost)}
              </p>
            </div>

            {/* ROI */}
            <div className="bg-slate-800/80 rounded-lg p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Return on Investment</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {financialMetrics.returnOnInvestment.toFixed(0)}%
              </h3>
              <p className="text-xs text-purple-400">
                LTV: {formatINR(financialMetrics.lifetimeValue)} | CAC: {formatINR(financialMetrics.customerAcquisitionCost)}
              </p>
            </div>
          </div>
        </div>

        {/* AI Credits & Growth Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* AI Credits Usage */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>
              </svg>
              AI Credits Usage & Cost
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Credits Issued</span>
                <span className="text-white font-semibold">{aiMetrics.totalCreditsIssued.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-400">Credits Used</span>
                <span className="text-white font-semibold">{aiMetrics.totalCreditsUsed.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${(aiMetrics.totalCreditsUsed / aiMetrics.totalCreditsIssued) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-400">Credits Remaining</span>
                <span className="text-white font-semibold">{aiMetrics.creditsRemaining.toLocaleString()}</span>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">AI Cost Spent</p>
                    <p className="text-lg font-bold text-red-400">{formatINR(aiMetrics.totalCreditsCost)}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Cost per Credit</p>
                    <p className="text-lg font-bold text-blue-400">{formatINR(aiMetrics.costPerCredit)}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Premium Credits</p>
                    <p className="text-lg font-bold text-purple-400">{aiMetrics.premiumUsersCredits.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Free Credits</p>
                    <p className="text-lg font-bold text-gray-400">{aiMetrics.freeUsersCredits.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth & Performance Metrics */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Growth & Performance
            </h3>
            
            <div className="space-y-6">
              {/* Revenue Growth */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Revenue Growth (MoM)</span>
                  <span className="text-green-400 font-semibold">+{financialMetrics.revenueGrowth}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full" 
                    style={{ width: `${Math.min(financialMetrics.revenueGrowth * 2, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* User Growth */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">User Growth (MoM)</span>
                  <span className="text-blue-400 font-semibold">+{financialMetrics.userGrowth}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full" 
                    style={{ width: `${Math.min(financialMetrics.userGrowth * 3, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Churn Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Churn Rate</span>
                  <span className="text-orange-400 font-semibold">{financialMetrics.churnRate}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-600 to-red-400 h-3 rounded-full" 
                    style={{ width: `${financialMetrics.churnRate * 5}%` }}
                  ></div>
                </div>
              </div>

              {/* Key Metrics Summary */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Avg Revenue per User</span>
                    <span className="text-white font-semibold">{formatINR(financialMetrics.averageRevenuePerUser)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Customer Acq. Cost</span>
                    <span className="text-white font-semibold">{formatINR(financialMetrics.customerAcquisitionCost)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Customer Lifetime Value</span>
                    <span className="text-white font-semibold">{formatINR(financialMetrics.lifetimeValue)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    <span className="text-sm text-gray-400 font-semibold">Marketing Spend</span>
                    <span className="text-purple-400 font-bold">{formatINR(financialMetrics.marketingSpend)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course Breakdown */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Course Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Completed Courses</span>
                <span className="text-white font-semibold">{courseStats.completedCourses}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(courseStats.completedCourses / courseStats.totalCourses) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-400">Draft Courses</span>
                <span className="text-white font-semibold">{courseStats.draftCourses}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(courseStats.draftCourses / courseStats.totalCourses) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-400">This Month</span>
                <span className="text-white font-semibold">{courseStats.coursesThisMonth}</span>
              </div>
            </div>
          </div>

          {/* Revenue Chart (Simple Bar Chart) */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              Revenue (Last 7 Days)
            </h3>
            <div className="flex items-end justify-between gap-2 h-40">
              {revenueData.map((day, index) => {
                const maxRevenue = Math.max(...revenueData.map(d => d.amount))
                const height = (day.amount / maxRevenue) * 100
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-purple-600 rounded-t hover:bg-purple-500 transition-all relative group" style={{ height: `${height}%` }}>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-700 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${day.amount}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(day.date).getDate()}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">Total: <span className="text-white font-semibold">${totalRevenueThisWeek.toLocaleString()}</span></p>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            Recent Sign-ups
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Courses</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-700 text-gray-400 rounded text-xs font-medium">Free</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white">{user.coursesCreated}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(user.signupDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
