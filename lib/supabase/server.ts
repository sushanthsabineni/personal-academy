import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

/**
 * Create a Supabase client for server-side operations
 * Use this in Server Components, Route Handlers, and Server Actions
 */
export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

/**
 * Helper to check if user is authenticated (server-side)
 */
export async function checkServerAuth() {
  const supabase = createServerSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Server auth check error:', error)
    return null
  }
  
  return session?.user || null
}

/**
 * Helper to get current user profile (server-side)
 */
export async function getServerProfile() {
  const user = await checkServerAuth()
  if (!user) return null
  
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching server profile:', error)
    return null
  }
  
  return data
}
