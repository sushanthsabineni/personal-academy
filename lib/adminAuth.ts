// Admin authentication utilities
// Uses Supabase authentication for secure admin access

import { supabase } from '@/lib/supabase/client'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super-admin'
  lastLogin?: string
}

export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    // @ts-expect-error - is_admin might not be in type
    return profile?.is_admin === true
  } catch {
    return false
  }
}

export const adminLogout = async () => {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

export const getAdminUser = async (): Promise<AdminUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, full_name, email')
      .eq('id', user.id)
      .single()

    // @ts-expect-error - is_admin might not be in type
    if (!profile?.is_admin) return null

    return {
      id: user.id,
      // @ts-expect-error - email might not be in type
      email: profile.email || user.email || '',
      // @ts-expect-error - full_name might not be in type
      name: profile.full_name || user.user_metadata?.full_name || 'Admin',
      role: 'admin',
      lastLogin: user.last_sign_in_at || undefined
    }
  } catch {
    return null
  }
}
