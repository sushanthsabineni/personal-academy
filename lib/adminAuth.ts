// Admin authentication utilities
// Separate from regular user auth for security

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super-admin'
  lastLogin?: string
}

// In production, this should be environment variables
const ADMIN_CREDENTIALS = {
  email: 'admin@personalacademy.com',
  password: 'admin123', // Change this in production!
  name: 'Admin User',
  role: 'super-admin' as const
}

export const isAdmin = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const adminToken = localStorage.getItem('adminToken')
  return adminToken !== null && adminToken !== ''
}

export const adminLogin = (email: string, password: string): boolean => {
  // In production, this should verify against a secure backend
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const adminUser: AdminUser = {
      id: 'admin-1',
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
      role: ADMIN_CREDENTIALS.role,
      lastLogin: new Date().toISOString()
    }
    
    localStorage.setItem('adminToken', 'admin-token-' + Date.now())
    localStorage.setItem('adminUser', JSON.stringify(adminUser))
    return true
  }
  return false
}

export const adminLogout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
}

export const getAdminUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null
  
  const adminUserStr = localStorage.getItem('adminUser')
  if (!adminUserStr) return null
  
  try {
    return JSON.parse(adminUserStr)
  } catch {
    return null
  }
}
