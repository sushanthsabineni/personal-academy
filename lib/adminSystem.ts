/**
 * Admin System Utilities
 * Provides CRUD operations and helpers for admin-related tables
 */

import { supabase } from '@/lib/supabase/client'

// Type definitions for admin tables (missing from Supabase generated types)
// Using unknown to satisfy ESLint while maintaining functionality
export type SystemSetting = unknown
export type AdminAction = unknown
export type UserActivityLog = unknown
export type FeatureFlag = unknown
export type SupportTicket = unknown
export type SupportTicketMessage = unknown
export type Announcement = unknown
export type SystemHealthMetric = unknown

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export async function getSystemSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .order('category', { ascending: true })
    .order('key', { ascending: true })

  if (error) throw error
  return data
}

export async function getSystemSetting(key: string) {
  const { data, error } = await (supabase
    .from('system_settings') as any)
    .select('value')
    .eq('key', key)
    .single()

  if (error) throw error
  return data?.value
}

export async function updateSystemSetting(key: string, value: string) {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('system_settings')
    .update({ 
      value,
      updated_at: new Date().toISOString(),
      updated_by: user?.id
    })
    .eq('key', key)
    .select()
    .single()

  if (error) throw error
  
  // Log the action
  await logAdminAction('system_setting_updated', { key, value })
  
  return data
}

export async function createSystemSetting(
  category: string,
  key: string,
  value: string,
  description?: string
) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('system_settings')
    .insert({
      category,
      key,
      value,
      description,
      updated_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  
  await logAdminAction('system_setting_created', { category, key, value })
  
  return data
}

// ============================================================================
// ADMIN ACTIONS (Audit Log)
// ============================================================================

export async function logAdminAction(
  action: string,
  details?: Record<string, unknown>,
  entityType?: string,
  entityId?: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('admin_actions')
    .insert({
      admin_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to log admin action:', error)
    return null
  }

  return data
}

export async function getAdminActions(limit = 100, offset = 0) {
  const { data, error } = await supabase
    .from('admin_actions')
    .select(`
      *,
      admin:profiles!admin_actions_admin_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

export async function getAdminActionsByAdmin(adminId: string, limit = 50) {
  const { data, error } = await supabase
    .from('admin_actions')
    .select('*')
    .eq('admin_id', adminId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getAdminActionsByEntity(entityType: string, entityId: string) {
  const { data, error } = await supabase
    .from('admin_actions')
    .select(`
      *,
      admin:profiles!admin_actions_admin_id_fkey(full_name, email)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================================================
// USER ACTIVITY LOGS
// ============================================================================

export async function getUserActivityLogs(userId?: string, limit = 100, offset = 0) {
  let query = supabase
    .from('user_activity_logs')
    .select(`
      *,
      user:profiles!user_activity_logs_user_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getRecentUserActivity(limit = 50) {
  const { data, error } = await supabase
    .from('user_activity_logs')
    .select(`
      *,
      user:profiles!user_activity_logs_user_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export async function getFeatureFlags() {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function getFeatureFlag(name: string) {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('name', name)
    .single()

  if (error) throw error
  return data
}

export async function updateFeatureFlag(name: string, enabled: boolean) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('feature_flags')
    .update({ 
      enabled,
      updated_at: new Date().toISOString(),
      updated_by: user?.id
    })
    .eq('name', name)
    .select()
    .single()

  if (error) throw error
  
  await logAdminAction('feature_flag_updated', { name, enabled })
  
  return data
}

export async function createFeatureFlag(
  name: string,
  description: string,
  enabled: boolean = false
) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('feature_flags')
    .insert({
      name,
      description,
      enabled,
      updated_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  
  await logAdminAction('feature_flag_created', { name, enabled })
  
  return data
}

// ============================================================================
// SUPPORT TICKETS
// ============================================================================

export async function getSupportTickets(status?: string, limit = 50, offset = 0) {
  let query = supabase
    .from('support_tickets')
    .select(`
      *,
      user:profiles!support_tickets_user_id_fkey(full_name, email),
      assigned_to_admin:profiles!support_tickets_assigned_to_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getSupportTicket(id: string) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      user:profiles!support_tickets_user_id_fkey(full_name, email),
      assigned_to_admin:profiles!support_tickets_assigned_to_fkey(full_name, email),
      messages:support_ticket_messages(
        *,
        sender:profiles!support_ticket_messages_sender_id_fkey(full_name, email)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createSupportTicket(
  subject: string,
  description: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: user.id,
      subject,
      description,
      priority,
      status: 'open'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSupportTicket(
  id: string,
  updates: {
    status?: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assigned_to?: string
  }
) {
  const { data, error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  
  await logAdminAction('support_ticket_updated', updates, 'support_ticket', id)
  
  return data
}

export async function addSupportTicketMessage(
  ticketId: string,
  message: string,
  isInternal: boolean = false
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('support_ticket_messages')
    .insert({
      ticket_id: ticketId,
      sender_id: user.id,
      message,
      is_internal: isInternal
    })
    .select()
    .single()

  if (error) throw error
  return data
}


// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export async function getAnnouncements(activeOnly = false) {
  let query = supabase
    .from('announcements')
    .select(`
      *,
      created_by_admin:profiles!announcements_created_by_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (activeOnly) {
    const now = new Date().toISOString()
    query = query
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getAnnouncement(id: string) {
  const { data, error } = await supabase
    .from('announcements')
    .select(`
      *,
      created_by_admin:profiles!announcements_created_by_fkey(full_name, email)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createAnnouncement(
  title: string,
  content: string,
  type: 'info' | 'warning' | 'success' | 'error',
  targetAudience: 'all' | 'free' | 'premium' | 'admins',
  startDate: string,
  endDate: string
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title,
      content,
      type,
      target_audience: targetAudience,
      start_date: startDate,
      end_date: endDate,
      created_by: user.id,
      is_active: true
    })
    .select()
    .single()

  if (error) throw error
  
  await logAdminAction('announcement_created', { title, type, targetAudience })
  
  return data
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<{
    title: string
    content: string
    type: 'info' | 'warning' | 'success' | 'error'
    target_audience: 'all' | 'free' | 'premium' | 'admins'
    start_date: string
    end_date: string
    is_active: boolean
  }>
) {
  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  
  await logAdminAction('announcement_updated', updates, 'announcement', id)
  
  return data
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) throw error
  
  await logAdminAction('announcement_deleted', {}, 'announcement', id)
}

// ============================================================================
// SYSTEM HEALTH METRICS
// ============================================================================

export async function getSystemHealthMetrics(
  metricType?: string,
  startDate?: string,
  endDate?: string,
  limit = 100
) {
  let query = supabase
    .from('system_health_metrics')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (metricType) {
    query = query.eq('metric_type', metricType)
  }

  if (startDate) {
    query = query.gte('timestamp', startDate)
  }

  if (endDate) {
    query = query.lte('timestamp', endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function recordSystemHealthMetric(
  metricType: string,
  metricValue: number,
  metadata?: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('system_health_metrics')
    .insert({
      metric_type: metricType,
      metric_value: metricValue,
      metadata
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// ANALYTICS HELPERS
// ============================================================================

export async function getAdminUserStats() {
  const { data, error } = await supabase
    .from('admin_user_stats')
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getAdminCourseStats() {
  const { data, error } = await supabase
    .from('admin_course_stats')
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getAdminRevenueStats() {
  const { data, error } = await supabase
    .from('admin_revenue_stats')
    .select('*')
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// USER MANAGEMENT HELPERS
// ============================================================================

export async function suspendUser(
  userId: string,
  reason: string,
  suspendedUntil?: string
) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .update({
      account_status: 'suspended',
      suspension_reason: reason,
      suspended_until: suspendedUntil,
      suspended_by: user?.id
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  
  await logAdminAction('user_suspended', { reason, suspendedUntil }, 'user', userId)
  
  return data
}

export async function unsuspendUser(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      account_status: 'active',
      suspension_reason: null,
      suspended_until: null,
      suspended_by: null
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  
  await logAdminAction('user_unsuspended', {}, 'user', userId)
  
  return data
}

export async function updateUserNotes(userId: string, notes: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ notes })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  
  await logAdminAction('user_notes_updated', { notes }, 'user', userId)
  
  return data
}

// ============================================================================
// SUPPORT TICKET FUNCTIONS
// ============================================================================

export async function createSupportTicketMessage(ticketId: string, message: string, senderType: 'admin' | 'user' = 'admin') {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('support_ticket_messages')
    .insert({
      ticket_id: ticketId,
      message,
      sender_type: senderType,
      sender_id: user?.id
    })
    .select()
    .single()

  if (error) throw error

  // Update ticket's updated_at timestamp
  await supabase
    .from('support_tickets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  await logAdminAction('support_message_sent', { ticketId, message: message.substring(0, 100) }, 'support_ticket', ticketId)

  return data
}

export async function getSupportTicketMessages(ticketId: string) {
  const { data, error } = await supabase
    .from('support_ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// ============================================================================
// CONTENT MODERATION FUNCTIONS
// ============================================================================

export type ContentItem = {
  id: string
  type: 'course' | 'lesson' | 'comment' | 'review'
  title: string
  content: string
  author_id: string
  author_email: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  created_at: string
  updated_at: string
  flags_count?: number
  reports?: ContentReport[]
}

export type ContentReport = {
  id: string
  content_id: string
  content_type: string
  reporter_id: string
  reporter_email: string
  reason: string
  description: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
}

export async function getContentModerationQueue() {
  // This would need to be implemented based on your actual content tables
  // For now, return empty array
  return []
}

export async function approveContent(contentId: string) {
  // This would need to be implemented based on your actual content tables
  // For now, just log the action
  await logAdminAction('content_approved', {}, 'content', contentId)
  return true
}

export async function rejectContent(contentId: string, reason?: string) {
  // This would need to be implemented based on your actual content tables
  // For now, just log the action
  await logAdminAction('content_rejected', { reason }, 'content', contentId)
  return true
}

export async function flagContent(contentId: string, reason?: string) {
  // This would need to be implemented based on your actual content tables
  // For now, just log the action
  await logAdminAction('content_flagged', { reason }, 'content', contentId)
  return true
}

export async function getContentReports() {
  // This would need to be implemented based on your actual content tables
  // For now, return empty array
  return []
}
