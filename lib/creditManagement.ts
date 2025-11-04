// Credit Management System
// Handles all credit-related operations

import { getAICreditRates } from './adminConfig'

// Helper to get current user info
function getUserInfo(): { email: string; id: string } | null {
  if (typeof window === 'undefined') return null
  
  // This is a synchronous fallback - actual auth should use supabase.auth.getSession()
  // For now, return null and let functions handle it
  return null
}

export interface CreditBalance {
  userId: string
  totalCredits: number
  availableCredits: number
  reservedCredits: number // Credits allocated but not yet spent
  lifetimeEarned: number
  lifetimeSpent: number
  lifetimePurchased: number
  lastUpdated: string
}

export interface CreditTransaction {
  id: string
  userId: string
  type: 'purchase' | 'spent' | 'earned' | 'refund' | 'bonus' | 'referral'
  amount: number
  balanceAfter: number
  description: string
  metadata?: {
    courseId?: string
    courseName?: string
    referralCode?: string
    packageId?: string
    sectionType?: string
    invoiceNumber?: string
  }
  timestamp: string
}

const CREDIT_BALANCE_KEY = 'creditBalance'
const CREDIT_TRANSACTIONS_KEY = 'creditTransactions'

// Get user's credit balance
export function getCreditBalance(userId?: string): CreditBalance {
  if (typeof window === 'undefined') {
    return {
      userId: userId || 'unknown',
      totalCredits: 0,
      availableCredits: 0,
      reservedCredits: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
      lifetimePurchased: 0,
      lastUpdated: new Date().toISOString(),
    }
  }

  const userInfo = getUserInfo()
  const targetUserId = userId || userInfo?.email || 'guest'

  const stored = localStorage.getItem(`${CREDIT_BALANCE_KEY}_${targetUserId}`)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return initializeCreditBalance(targetUserId)
    }
  }

  return initializeCreditBalance(targetUserId)
}

// Initialize credit balance for new user
function initializeCreditBalance(userId: string): CreditBalance {
  const balance: CreditBalance = {
    userId,
    totalCredits: 1000, // Starting credits for new users
    availableCredits: 1000,
    reservedCredits: 0,
    lifetimeEarned: 1000,
    lifetimeSpent: 0,
    lifetimePurchased: 0,
    lastUpdated: new Date().toISOString(),
  }

  saveCreditBalance(balance)
  return balance
}

// Save credit balance
function saveCreditBalance(balance: CreditBalance): void {
  if (typeof window === 'undefined') return

  const updatedBalance = {
    ...balance,
    lastUpdated: new Date().toISOString(),
  }

  localStorage.setItem(
    `${CREDIT_BALANCE_KEY}_${balance.userId}`,
    JSON.stringify(updatedBalance)
  )
}

// Get credit transactions
export function getCreditTransactions(userId?: string): CreditTransaction[] {
  if (typeof window === 'undefined') return []

  const userInfo = getUserInfo()
  const targetUserId = userId || userInfo?.email || 'guest'

  const stored = localStorage.getItem(`${CREDIT_TRANSACTIONS_KEY}_${targetUserId}`)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  return []
}

// Save credit transactions
function saveCreditTransactions(userId: string, transactions: CreditTransaction[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    `${CREDIT_TRANSACTIONS_KEY}_${userId}`,
    JSON.stringify(transactions)
  )
}

// Add credit transaction
function addCreditTransaction(transaction: Omit<CreditTransaction, 'id' | 'timestamp'>): void {
  const transactions = getCreditTransactions(transaction.userId)
  const newTransaction: CreditTransaction = {
    ...transaction,
    id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  transactions.unshift(newTransaction) // Add to beginning
  saveCreditTransactions(transaction.userId, transactions)
}

// Purchase credits
export function purchaseCredits(
  credits: number,
  packageId: string,
  invoiceNumber?: string
): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  const balance = getCreditBalance(userInfo.email)

  balance.totalCredits += credits
  balance.availableCredits += credits
  balance.lifetimePurchased += credits
  balance.lifetimeEarned += credits

  saveCreditBalance(balance)

  addCreditTransaction({
    userId: userInfo.email,
    type: 'purchase',
    amount: credits,
    balanceAfter: balance.totalCredits,
    description: `Purchased ${credits} credits`,
    metadata: {
      packageId,
      invoiceNumber,
    },
  })

  return true
}

// Spend credits (deduct)
export function spendCredits(
  credits: number,
  description: string,
  metadata?: CreditTransaction['metadata']
): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  const balance = getCreditBalance(userInfo.email)

  if (balance.availableCredits < credits) {
    return false // Insufficient credits
  }

  balance.totalCredits -= credits
  balance.availableCredits -= credits
  balance.lifetimeSpent += credits

  saveCreditBalance(balance)

  addCreditTransaction({
    userId: userInfo.email,
    type: 'spent',
    amount: -credits,
    balanceAfter: balance.totalCredits,
    description,
    metadata,
  })

  // Send push notification if credits are running low (below 100)
  if (balance.availableCredits < 100 && balance.availableCredits >= 0) {
    import('./pushNotifications').then(({ sendCreditsLowNotification }) => {
      sendCreditsLowNotification(userInfo.id, balance.availableCredits).catch(console.error)
    }).catch(console.error)
  }

  return true
}

// Earn credits (bonus, referral, etc.)
export function earnCredits(
  credits: number,
  type: 'earned' | 'bonus' | 'referral',
  description: string,
  metadata?: CreditTransaction['metadata']
): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  const balance = getCreditBalance(userInfo.email)

  balance.totalCredits += credits
  balance.availableCredits += credits
  balance.lifetimeEarned += credits

  saveCreditBalance(balance)

  addCreditTransaction({
    userId: userInfo.email,
    type,
    amount: credits,
    balanceAfter: balance.totalCredits,
    description,
    metadata,
  })

  // Send push notification for referral rewards
  if (type === 'referral') {
    import('./pushNotifications').then(({ sendReferralRewardNotification }) => {
      sendReferralRewardNotification(userInfo.id, credits).catch(console.error)
    }).catch(console.error)
  }

  return true
}

// Reserve credits (for pending operations)
export function reserveCredits(credits: number): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  const balance = getCreditBalance(userInfo.email)

  if (balance.availableCredits < credits) {
    return false
  }

  balance.availableCredits -= credits
  balance.reservedCredits += credits

  saveCreditBalance(balance)
  return true
}

// Release reserved credits (cancel operation)
export function releaseReservedCredits(credits: number): void {
  const userInfo = getUserInfo()
  if (!userInfo) return

  const balance = getCreditBalance(userInfo.email)

  balance.availableCredits += credits
  balance.reservedCredits -= credits

  saveCreditBalance(balance)
}

// Confirm reserved credits as spent
export function confirmReservedCredits(
  credits: number,
  description: string,
  metadata?: CreditTransaction['metadata']
): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  const balance = getCreditBalance(userInfo.email)

  if (balance.reservedCredits < credits) {
    return false
  }

  balance.totalCredits -= credits
  balance.reservedCredits -= credits
  balance.lifetimeSpent += credits

  saveCreditBalance(balance)

  addCreditTransaction({
    userId: userInfo.email,
    type: 'spent',
    amount: -credits,
    balanceAfter: balance.totalCredits,
    description,
    metadata,
  })

  return true
}

// Check if user has enough credits
export function hasEnoughCredits(creditsNeeded: number): boolean {
  const balance = getCreditBalance()
  return balance.availableCredits >= creditsNeeded
}

// Calculate credits needed for course section
export function calculateCreditsForSection(sectionType: string): number {
  const rates = getAICreditRates()

  const mapping: { [key: string]: keyof typeof rates } = {
    'learning-outcomes': 'learningOutcomes',
    'modules': 'modules',
    'lessons': 'lessons',
    'quiz': 'quiz',
    'assessments': 'assessments',
    'certificates': 'certificates',
  }

  const rateKey = mapping[sectionType]
  return rateKey ? rates[rateKey] : 10 // Default to 10 if unknown
}

// Get credit statistics
export function getCreditStatistics(userId?: string) {
  const balance = getCreditBalance(userId)
  const transactions = getCreditTransactions(userId)

  const purchased = transactions.filter(t => t.type === 'purchase')
  const spent = transactions.filter(t => t.type === 'spent')
  const earned = transactions.filter(t => t.type === 'earned' || t.type === 'bonus' || t.type === 'referral')

  return {
    balance,
    transactionCount: transactions.length,
    purchaseCount: purchased.length,
    spentCount: spent.length,
    earnedCount: earned.length,
    averageSpendPerTransaction: spent.length > 0
      ? Math.abs(spent.reduce((sum, t) => sum + t.amount, 0) / spent.length)
      : 0,
  }
}

// Refund credits
export function refundCredits(
  credits: number,
  description: string,
  metadata?: CreditTransaction['metadata']
): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  const balance = getCreditBalance(userInfo.email)

  balance.totalCredits += credits
  balance.availableCredits += credits

  saveCreditBalance(balance)

  addCreditTransaction({
    userId: userInfo.email,
    type: 'refund',
    amount: credits,
    balanceAfter: balance.totalCredits,
    description,
    metadata,
  })

  return true
}
