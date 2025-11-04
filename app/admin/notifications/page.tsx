'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Bell, Send, Mail, Users, CheckCircle, AlertCircle, X } from '@/lib/icons'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  full_name: string | null
  credits_balance: number
}

type NotificationCategory = 'info' | 'success' | 'warning' | 'error'

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Notification form
  const [notificationType, setNotificationType] = useState<'single' | 'all' | 'selected'>('all')
  const [singleUserId, setSingleUserId] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [notifType, setNotifType] = useState<NotificationCategory>('info')
  const [icon, setIcon] = useState('📢')
  const [link, setLink] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [sendPush, setSendPush] = useState(true)

  // Email preferences
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [respectPreferences, setRespectPreferences] = useState(true)

  const checkAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/admin/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile as any).is_admin) {
      router.push('/')
    }
  }, [router])

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, credits_balance')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }, [])

  useEffect(() => {
    checkAdmin()
    fetchUsers()
  }, [checkAdmin, fetchUsers])

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u.id))
    }
    setSelectAll(!selectAll)
  }

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSendNotification = async () => {
    if (!title.trim() || !body.trim()) {
      setError('Title and message are required')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let targetUserIds: string[] = []

      if (notificationType === 'all') {
        targetUserIds = users.map(u => u.id)
      } else if (notificationType === 'selected') {
        if (selectedUsers.length === 0) {
          setError('Please select at least one user')
          setLoading(false)
          return
        }
        targetUserIds = selectedUsers
      } else if (notificationType === 'single') {
        if (!singleUserId) {
          setError('Please select a user')
          setLoading(false)
          return
        }
        targetUserIds = [singleUserId]
      }

      // Send notifications
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: targetUserIds,
          title,
          body,
          type: notifType,
          icon,
          link: link || null,
          sendPush,
          sendEmail,
          emailSubject: sendEmail ? emailSubject : null,
          emailBody: sendEmail ? emailBody : null,
          respectPreferences,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send notifications')
      }

      const result = await response.json()
      setSuccess(`Successfully sent notifications to ${result.sent} user(s)`)
      
      // Reset form
      setTitle('')
      setBody('')
      setEmailSubject('')
      setEmailBody('')
      setLink('')
      setSelectedUsers([])
      setSelectAll(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send notifications'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Send Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send push notifications and emails to users
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-700">
              <X size={20} />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-700">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notification Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recipient Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                Select Recipients
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="all"
                      checked={notificationType === 'all'}
                      onChange={(e) => setNotificationType(e.target.value as 'all')}
                      className="w-4 h-4 text-brand-teal"
                    />
                    <span className="text-gray-700 dark:text-gray-300">All Users ({users.length})</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="selected"
                      checked={notificationType === 'selected'}
                      onChange={(e) => setNotificationType(e.target.value as 'selected')}
                      className="w-4 h-4 text-brand-teal"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Selected Users</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="single"
                      checked={notificationType === 'single'}
                      onChange={(e) => setNotificationType(e.target.value as 'single')}
                      className="w-4 h-4 text-brand-teal"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Single User</span>
                  </label>
                </div>

                {notificationType === 'single' && (
                  <select
                    value={singleUserId}
                    onChange={(e) => setSingleUserId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email} - {user.credits_balance} credits
                      </option>
                    ))}
                  </select>
                )}

                {notificationType === 'selected' && (
                  <div className="border border-gray-300 dark:border-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <label className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-brand-teal"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">Select All</span>
                    </label>
                    {users.map(user => (
                      <label key={user.id} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="w-4 h-4 text-brand-teal"
                        />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {user.full_name || user.email} - {user.credits_balance} credits
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notification Content */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell size={20} />
                Notification Content
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={notifType}
                      onChange={(event) => setNotifType(event.target.value as NotificationCategory)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      placeholder="📢"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., New Feature Released!"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter notification message..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/dashboard or https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendPush}
                      onChange={(e) => setSendPush(e.target.checked)}
                      className="w-4 h-4 text-brand-teal"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Send Push Notification</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="w-4 h-4 text-brand-teal"
                    />
                    <span className="text-gray-700 dark:text-gray-300">Send Email</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Email Content */}
            {sendEmail && (
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Mail size={20} />
                  Email Content
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="e.g., New Feature: AI Course Generator"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Body
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Enter email message (supports HTML)..."
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none font-mono text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={respectPreferences}
                      onChange={(e) => setRespectPreferences(e.target.checked)}
                      className="w-4 h-4 text-brand-teal"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Respect user email preferences (only send to users who opted in)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendNotification}
              disabled={loading}
              className="w-full bg-brand-teal hover:bg-brand-cyan disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Notification
                </>
              )}
            </button>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Preview
              </h2>

              {/* Push Notification Preview */}
              {sendPush && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Push Notification:
                  </p>
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          {title || 'Notification Title'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {body || 'Notification message will appear here...'}
                        </p>
                        {link && (
                          <p className="text-xs text-brand-teal mt-2">
                            🔗 {link}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Preview */}
              {sendEmail && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Email:
                  </p>
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      {emailSubject || 'Email Subject'}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {emailBody || 'Email body will appear here...'}
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient Count */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Recipients:</strong>{' '}
                  {notificationType === 'all' ? users.length : 
                   notificationType === 'selected' ? selectedUsers.length :
                   singleUserId ? 1 : 0} user(s)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
