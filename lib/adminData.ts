// Admin analytics and user management utilities
import { convertUSDtoINR, formatINR } from './adminConfig'
import { getCurrentMonthTotalExpenses, getExpensesSummaryByCategory } from './expenses'

export interface UserProfile {
  id: string
  name: string
  email: string
  signupDate: string
  isPremium: boolean
  credits: number
  coursesCreated: number
  lastActive: string
  authProvider: 'email' | 'google'
  profilePicture?: string
}

export interface DailyRevenue {
  date: string
  amount: number
  subscriptions: number
}

export interface CourseStats {
  totalCourses: number
  completedCourses: number
  draftCourses: number
  coursesThisWeek: number
  coursesThisMonth: number
}

export interface PlatformMetrics {
  totalUsers: number
  freeUsers: number
  premiumUsers: number
  activeUsersToday: number
  totalRevenue: number
  revenueThisMonth: number
  revenueToday: number
  lifetimeRevenue: number
}

export interface FinancialMetrics {
  // Revenue
  totalRevenue: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  
  // Costs
  aiCreditsSpent: number
  infrastructureCost: number
  marketingSpend: number
  totalExpenses: number
  
  // Profitability
  netProfit: number
  profitMargin: number
  
  // Growth
  revenueGrowth: number
  userGrowth: number
  churnRate: number
  
  // ROI
  customerAcquisitionCost: number
  lifetimeValue: number
  returnOnInvestment: number
}

export interface AICreditsMetrics {
  totalCreditsIssued: number
  totalCreditsUsed: number
  creditsRemaining: number
  costPerCredit: number
  totalCreditsCost: number
  averageCreditsPerUser: number
  premiumUsersCredits: number
  freeUsersCredits: number
}

// Mock data generator - In production, this would come from a real database
export const generateMockUsers = (): UserProfile[] => {
  const users: UserProfile[] = []
  const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis', 'Chris Wilson', 'Lisa Anderson']
  
  for (let i = 0; i < 50; i++) {
    const isPremium = Math.random() > 0.7
    users.push({
      id: `user-${i + 1}`,
      name: names[i % names.length] + ` ${i + 1}`,
      email: `user${i + 1}@example.com`,
      signupDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      isPremium,
      credits: isPremium ? Math.floor(Math.random() * 5000) + 1000 : Math.floor(Math.random() * 500),
      coursesCreated: Math.floor(Math.random() * (isPremium ? 20 : 3)),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      authProvider: Math.random() > 0.5 ? 'google' : 'email',
      profilePicture: Math.random() > 0.5 ? `https://i.pravatar.cc/150?img=${i}` : undefined
    })
  }
  
  return users
}

// Get all users (in production, this would be paginated)
export const getAllUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem('adminUsersList')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // If parsing fails, generate new mock data
    }
  }
  
  // Generate and store mock users
  const users = generateMockUsers()
  localStorage.setItem('adminUsersList', JSON.stringify(users))
  return users
}

// Update user credits
export const updateUserCredits = (userId: string, credits: number): boolean => {
  const users = getAllUsers()
  const userIndex = users.findIndex(u => u.id === userId)
  
  if (userIndex === -1) return false
  
  users[userIndex].credits = credits
  localStorage.setItem('adminUsersList', JSON.stringify(users))
  return true
}

// Get course statistics
export const getCourseStats = (): CourseStats => {
  // In production, this would query the actual database
  const users = getAllUsers()
  const totalCourses = users.reduce((sum, user) => sum + user.coursesCreated, 0)
  
  return {
    totalCourses,
    completedCourses: Math.floor(totalCourses * 0.7),
    draftCourses: Math.floor(totalCourses * 0.3),
    coursesThisWeek: Math.floor(totalCourses * 0.1),
    coursesThisMonth: Math.floor(totalCourses * 0.4)
  }
}

// Get platform metrics
export const getPlatformMetrics = (): PlatformMetrics => {
  const users = getAllUsers()
  const premiumUsers = users.filter(u => u.isPremium).length
  const freeUsers = users.length - premiumUsers
  const monthlyRateINR = convertUSDtoINR(50) // $50 = ₹4,150 (configurable in pricing)
  const avgLifetimeMonths = 6
  
  return {
    totalUsers: users.length,
    freeUsers,
    premiumUsers,
    activeUsersToday: Math.floor(users.length * 0.3),
    totalRevenue: premiumUsers * monthlyRateINR * 3,
    revenueThisMonth: premiumUsers * monthlyRateINR,
    revenueToday: Math.floor(premiumUsers * monthlyRateINR / 30),
    lifetimeRevenue: premiumUsers * monthlyRateINR * avgLifetimeMonths
  }
}

// Get financial metrics
export const getFinancialMetrics = (): FinancialMetrics => {
  const metrics = getPlatformMetrics()
  const users = getAllUsers()
  
  // Revenue calculations (all in INR now)
  const totalRevenue = metrics.lifetimeRevenue
  const monthlyRecurringRevenue = metrics.revenueThisMonth
  const averageRevenuePerUser = metrics.premiumUsers > 0 
    ? totalRevenue / metrics.premiumUsers 
    : 0
  
  // Get actual expenses from expense tracking
  const expensesSummary = getExpensesSummaryByCategory()
  const actualMonthlyExpenses = getCurrentMonthTotalExpenses()
  
  // Cost calculations (in INR)
  const totalCredits = users.reduce((sum, u) => sum + u.credits, 0)
  const costPerCredit = convertUSDtoINR(0.001) // Convert $0.001 to INR (≈₹0.083)
  const aiCreditsSpent = expensesSummary['AI Credits'] || (totalCredits * costPerCredit)
  const infrastructureCost = expensesSummary['Infrastructure'] || convertUSDtoINR(2500)
  const marketingSpend = expensesSummary['Marketing'] || convertUSDtoINR(5000)
  const toolsSubscriptions = expensesSummary['Tools & Subscriptions'] || 0
  const developmentCosts = expensesSummary['Development'] || 0
  const otherCosts = expensesSummary['Other'] || 0
  
  // Use actual tracked expenses if available, otherwise use calculated estimates
  const totalExpenses = actualMonthlyExpenses > 0 
    ? actualMonthlyExpenses 
    : (aiCreditsSpent + infrastructureCost + marketingSpend + toolsSubscriptions + developmentCosts + otherCosts)
  
  // Profitability
  const netProfit = monthlyRecurringRevenue - (totalExpenses / 3) // Monthly profit
  const profitMargin = monthlyRecurringRevenue > 0 
    ? (netProfit / monthlyRecurringRevenue) * 100 
    : 0
  
  // Growth metrics
  const revenueGrowth = 23.5 // Percentage growth month-over-month
  const userGrowth = 15.8 // Percentage growth month-over-month
  const churnRate = 4.2 // Percentage of users who canceled
  
  // ROI metrics
  const customerAcquisitionCost = marketingSpend / (metrics.totalUsers * 0.1) // 10% came from marketing
  const lifetimeValue = averageRevenuePerUser
  const returnOnInvestment = lifetimeValue > 0 
    ? ((lifetimeValue - customerAcquisitionCost) / customerAcquisitionCost) * 100 
    : 0
  
  return {
    totalRevenue,
    monthlyRecurringRevenue,
    averageRevenuePerUser,
    aiCreditsSpent,
    infrastructureCost,
    marketingSpend,
    totalExpenses,
    netProfit,
    profitMargin,
    revenueGrowth,
    userGrowth,
    churnRate,
    customerAcquisitionCost,
    lifetimeValue,
    returnOnInvestment
  }
}

// Get AI credits metrics (in INR)
export const getAICreditsMetrics = (): AICreditsMetrics => {
  const users = getAllUsers()
  const premiumUsers = users.filter(u => u.isPremium)
  const freeUsers = users.filter(u => !u.isPremium)
  
  const totalCreditsIssued = users.reduce((sum, u) => sum + u.credits, 0)
  const totalCreditsUsed = Math.floor(totalCreditsIssued * 0.65) // 65% usage rate
  const creditsRemaining = totalCreditsIssued - totalCreditsUsed
  const costPerCreditINR = convertUSDtoINR(0.001) // $0.001 = ₹0.083 per credit
  const totalCreditsCost = totalCreditsUsed * costPerCreditINR
  
  const premiumCredits = premiumUsers.reduce((sum, u) => sum + u.credits, 0)
  const freeCredits = freeUsers.reduce((sum, u) => sum + u.credits, 0)
  
  return {
    totalCreditsIssued,
    totalCreditsUsed,
    creditsRemaining,
    costPerCredit: costPerCreditINR,
    totalCreditsCost,
    averageCreditsPerUser: users.length > 0 ? totalCreditsIssued / users.length : 0,
    premiumUsersCredits: premiumCredits,
    freeUsersCredits: freeCredits
  }
}

// Get daily revenue data for charts
export const getDailyRevenue = (days: number = 30): DailyRevenue[] => {
  const revenue: DailyRevenue[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    revenue.push({
      date: date.toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 1000) + 200,
      subscriptions: Math.floor(Math.random() * 10) + 1
    })
  }
  
  return revenue
}

// Get user by ID
export const getUserById = (userId: string): UserProfile | null => {
  const users = getAllUsers()
  return users.find(u => u.id === userId) || null
}

// Search users
export const searchUsers = (query: string): UserProfile[] => {
  const users = getAllUsers()
  const lowerQuery = query.toLowerCase()
  
  return users.filter(u => 
    u.name.toLowerCase().includes(lowerQuery) ||
    u.email.toLowerCase().includes(lowerQuery) ||
    u.id.toLowerCase().includes(lowerQuery)
  )
}
