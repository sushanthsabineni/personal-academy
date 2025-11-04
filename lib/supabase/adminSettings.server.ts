// Admin Settings - Server-only functions
// This file can only be imported in Server Components, Server Actions, and API routes

import { createServerSupabaseClient } from './server'

export interface AdminSettings {
  id: string
  user_id: string
  openrouter_api_key?: string
  openrouter_model: string
  temperature: number
  max_tokens: number
  created_at: string
  updated_at: string
}

/**
 * Fetch admin settings from database (server-side only)
 * Called from Server Actions and API routes
 * Use the 'use server' directive in calling functions
 */
export async function getAdminSettingsFromDb(): Promise<AdminSettings | null> {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current admin user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn('No authenticated user for admin settings')
      return null
    }

    // Fetch admin settings for this user
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (not an error, just no settings yet)
      console.error('Error fetching admin settings:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Failed to fetch admin settings from database:', error)
    return null
  }
}
