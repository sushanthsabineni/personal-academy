import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './database.types'

export const supabase = createClientComponentClient<Database>()

// Helper to check if user is authenticated
export async function checkAuth() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Auth check error:', error)
    return null
  }
  return session?.user || null
}

// Helper to get current user profile
export async function getCurrentProfile() {
  const user = await checkAuth()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
}
