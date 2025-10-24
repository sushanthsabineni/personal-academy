// Simple authentication utilities
// In production, replace with your actual auth system (NextAuth, Auth0, etc.)

export interface UserInfo {
  name: string
  email: string
  picture: string
  authProvider: 'google' | 'email' | 'github'
}

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // Check if user has an auth token
  const authToken = localStorage.getItem('authToken')
  return authToken !== null && authToken !== ''
}

export const login = (token: string, userInfo?: UserInfo) => {
  localStorage.setItem('authToken', token)
  if (userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  }
  
  // Set cookie for middleware authentication
  document.cookie = `authToken=${token}; path=/; max-age=2592000; SameSite=Lax`
}

export const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('isPremium')
  sessionStorage.clear()
  
  // Clear auth cookie
  document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax'
}

export const getUserInfo = (): UserInfo | null => {
  if (typeof window === 'undefined') return null
  
  const userInfoStr = localStorage.getItem('userInfo')
  if (!userInfoStr) return null
  
  try {
    return JSON.parse(userInfoStr)
  } catch {
    return null
  }
}

// Async version for compatibility with components expecting async getCurrentUser
export const getCurrentUser = async (): Promise<UserInfo | null> => {
  return getUserInfo()
}

export const updateUserInfo = (userInfo: Partial<UserInfo>) => {
  const current = getUserInfo()
  if (current) {
    localStorage.setItem('userInfo', JSON.stringify({ ...current, ...userInfo }))
  }
}

// Check if user has a premium subscription
export const isPremiumUser = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // Check if user has premium status
  const premiumStatus = localStorage.getItem('isPremium')
  return premiumStatus === 'true'
}

// Set premium status
export const setPremiumStatus = (isPremium: boolean) => {
  localStorage.setItem('isPremium', isPremium.toString())
}

// Course limits - dynamically loaded from platform config
export const getCourseLimit = (): number => {
  if (typeof window === 'undefined') return 3
  
  try {
    // Get limits from localStorage directly to avoid circular dependency
    const platformConfig = localStorage.getItem('platformConfig')
    if (platformConfig) {
      const config = JSON.parse(platformConfig)
      const isPremium = isPremiumUser()
      const limit = isPremium ? config.courseLimits.premiumPlanLimit : config.courseLimits.freePlanLimit
      return limit === -1 ? Infinity : limit
    }
  } catch {
    // Fallback to default values
  }
  
  return isPremiumUser() ? Infinity : 3
}

export const canCreateMoreCourses = (currentCourseCount: number): boolean => {
  const limit = getCourseLimit()
  return currentCourseCount < limit
}

// Public routes that don't require authentication
export const publicRoutes = [
  '/',
  '/login',
  '/pricing',
  '/refer',
  '/coming-soon',
  '/help',
  '/faq',
  '/tutorials',
  '/api-docs',
  '/support',
  '/trust'
]

// Routes that require authentication
export const protectedRoutes = [
  '/dashboard',
  '/create',
  '/account'
]

export const isPublicRoute = (pathname: string): boolean => {
  // Check exact matches first
  if (publicRoutes.includes(pathname)) return true
  
  // Check if it starts with /trust (all trust center pages are public)
  if (pathname.startsWith('/trust')) return true
  
  // Check if it starts with /terms (redirect pages)
  if (pathname.startsWith('/terms')) return true
  
  return false
}

export const isProtectedRoute = (pathname: string): boolean => {
  return protectedRoutes.some(route => pathname.startsWith(route))
}
