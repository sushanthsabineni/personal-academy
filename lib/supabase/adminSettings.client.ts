// Admin Settings - Client-side functions
// This file can be safely imported in Client Components

import { supabase } from './client'

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
 * Save admin settings to database (client-side)
 */
export async function saveAdminSettingsToDb(settings: Partial<AdminSettings>): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user')
      return false
    }

    const { data: existing } = await supabase
      .from('admin_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('admin_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating admin settings:', error)
        return false
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('admin_settings')
        .insert({
          user_id: user.id,
          openrouter_model: 'openai/gpt-4o',
          temperature: 0.7,
          max_tokens: 4096,
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error creating admin settings:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Failed to save admin settings:', error)
    return false
  }
}
