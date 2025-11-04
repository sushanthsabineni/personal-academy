'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Lock, Bell, Globe, Save, Eye, EyeOff,
  CheckCircle2, AlertCircle, Shield, CreditCard, LogOut, Clock, X, Loader2
} from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

interface DeletionStatus {
  accountStatus: 'active' | 'pending_deletion' | 'deleted'
  deletionDate: string | null
  daysUntilDeletion: number | null
  credits?: {
    balance: number
    isPremium: boolean
    expiringAmount: number
    daysUntilExpiry: number | null
  }
  dataRetentionPolicy: {
    gracePeriod: number
    userDataRetention: string
    paymentRetention: string
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'account'>('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Profile state
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    provider: '', // 'email', 'google', etc.
  })

  // Security state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNewFeatures: true,
    emailTips: false,
    emailMarketing: false,
    pushCourseComplete: true,
    pushCreditsLow: true,
    pushReferrals: true,
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    defaultExportFormat: 'pdf',
  })

  // Initialize push notifications
  const pushNotifications = usePushNotifications()

  // Fetch account deletion status and preferences on mount
  useEffect(() => {
    fetchDeletionStatus()
    fetchProfile()
    fetchPreferences()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      
      const data = await response.json()
      if (data.profile) {
        setProfileData({
          full_name: data.profile.full_name || '',
          email: data.profile.email || '',
          provider: data.profile.auth_provider || 'email', // Get auth provider
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user-preferences')
      if (response.ok) {
        const data = await response.json()
        if (data.preferences) {
          // Map snake_case from DB to camelCase for state
          setNotifications({
            emailNewFeatures: data.preferences.email_new_features ?? true,
            emailTips: data.preferences.email_tips ?? false,
            emailMarketing: data.preferences.email_marketing ?? false,
            pushCourseComplete: data.preferences.push_course_complete ?? true,
            pushCreditsLow: data.preferences.push_credits_low ?? true,
            pushReferrals: data.preferences.push_referrals ?? true,
          })
          setPreferences({
            timezone: data.preferences.timezone || 'America/Los_Angeles',
            dateFormat: data.preferences.date_format || 'MM/DD/YYYY',
            defaultExportFormat: data.preferences.default_export_format || 'pdf',
          })
        }
      }
    } catch (err) {
      console.error('Error fetching preferences:', err)
    }
  }

  const fetchDeletionStatus = async () => {
    try {
      const response = await fetch('/api/account/status')
      if (response.ok) {
        const data = await response.json()
        setDeletionStatus(data)
      }
    } catch (err) {
      console.error('Error fetching deletion status:', err)
    }
  }

  const handleSaveProfile = async () => {
    if (!profileData.full_name.trim()) {
      alert('Full name is required')
      return
    }

    setSaveStatus('saving')
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: profileData.full_name }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      if (data.profile) {
        setProfileData({
          full_name: data.profile.full_name || '',
          email: data.profile.email || '',
          provider: data.profile.auth_provider || 'email',
        })
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setSaveStatus('error')
      alert('Failed to save changes. Please try again.')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleSaveNotifications = async () => {
    setSaveStatus('saving')
    try {
      // Check if any push notification is enabled
      const anyPushEnabled = 
        notifications.pushCourseComplete || 
        notifications.pushCreditsLow || 
        notifications.pushReferrals

      // If push notifications are enabled and not already subscribed, subscribe
      if (anyPushEnabled && !pushNotifications.isSubscribed) {
        const subscribed = await pushNotifications.subscribe()
        if (!subscribed) {
          throw new Error('Failed to subscribe to push notifications')
        }
      }
      // If all push notifications are disabled and user is subscribed, unsubscribe
      else if (!anyPushEnabled && pushNotifications.isSubscribed) {
        const unsubscribed = await pushNotifications.unsubscribe()
        if (!unsubscribed) {
          throw new Error('Failed to unsubscribe from push notifications')
        }
      }

      const response = await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_new_features: notifications.emailNewFeatures,
          email_tips: notifications.emailTips,
          email_marketing: notifications.emailMarketing,
          push_course_complete: notifications.pushCourseComplete,
          push_credits_low: notifications.pushCreditsLow,
          push_referrals: notifications.pushReferrals,
          timezone: preferences.timezone,
          date_format: preferences.dateFormat,
          default_export_format: preferences.defaultExportFormat,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error('Error saving preferences:', err)
      setSaveStatus('error')
      alert(err instanceof Error ? err.message : 'Failed to save preferences')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleRequestDeletion = async () => {
    if (deleteConfirmEmail.toLowerCase() !== profileData.email.toLowerCase()) {
      alert('Email does not match. Please enter your account email to confirm.')
      return
    }

    setSaveStatus('saving')
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmEmail: deleteConfirmEmail })
      })

      if (response.ok) {
        const data = await response.json()
        setSaveStatus('saved')
        setDeleteConfirmEmail('')
        await fetchDeletionStatus() // Refresh status
        alert(`Account deletion scheduled. You have ${data.gracePeriod} days to cancel.`)
      } else {
        const error = await response.json()
        setSaveStatus('error')
        alert(error.error || 'Failed to schedule account deletion')
      }
    } catch (err) {
      console.error('Deletion request error:', err)
      setSaveStatus('error')
      alert('An error occurred. Please try again.')
    } finally {
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleCancelDeletion = async () => {
    if (!confirm('Are you sure you want to cancel account deletion?')) return

    setSaveStatus('saving')
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE'
      })

      if (response.ok) {
        setSaveStatus('saved')
        await fetchDeletionStatus() // Refresh status
        alert('Account deletion cancelled successfully!')
      } else {
        const error = await response.json()
        setSaveStatus('error')
        alert(error.error || 'Failed to cancel account deletion')
      }
    } catch (err) {
      console.error('Cancellation error:', err)
      setSaveStatus('error')
      alert('An error occurred. Please try again.')
    } finally {
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    sessionStorage.clear()
    // Use window.location for full page reload
    window.location.href = '/'
  }

  const tabs = [
    { id: 'profile', label: 'Profile & Security', icon: User },
    { id: 'notifications', label: 'Notifications & Preferences', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-display font-bold mb-3 text-light-text dark:text-dark-text">
            Account Settings ⚙️
          </h1>
          <p className="text-xl text-light-muted dark:text-dark-muted">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-light-card dark:bg-dark-card rounded-xl p-4 border border-light-border dark:border-dark-border sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-brand-teal text-white'
                        : 'text-light-text dark:text-dark-text hover:bg-light-bg dark:hover:bg-dark-bg'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-light-card dark:bg-dark-card rounded-xl p-8 border border-light-border dark:border-dark-border">
              
              {/* Profile & Security Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
                    Profile & Security
                  </h2>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                      <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="animate-spin text-brand-teal" size={40} />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      
                      {/* Profile Information Section */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                          <User size={20} />
                          Profile Information
                        </h3>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                Full Name {profileData.provider !== 'google' && '*'}
                              </label>
                              <input
                                type="text"
                                value={profileData.full_name}
                                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                disabled={profileData.provider === 'google'}
                                className={`w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border ${
                                  profileData.provider === 'google'
                                    ? 'bg-light-bg/50 dark:bg-dark-bg/50 text-light-muted dark:text-dark-muted cursor-not-allowed'
                                    : 'bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal'
                                } outline-none`}
                                placeholder="Enter your full name"
                                title={profileData.provider === 'google' ? 'Name is managed by your Google account' : ''}
                              />
                              {profileData.provider === 'google' && (
                                <p className="mt-2 text-xs text-light-muted dark:text-dark-muted flex items-center gap-1">
                                  <Shield size={12} />
                                  Name is synced from your Google account
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={profileData.email}
                                disabled
                                className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50 text-light-muted dark:text-dark-muted cursor-not-allowed"
                                title="Email cannot be changed"
                              />
                              <p className="mt-2 text-xs text-light-muted dark:text-dark-muted">
                                Email is linked to your account and cannot be changed
                              </p>
                            </div>
                          </div>
                          {profileData.provider !== 'google' && (
                            <div className="flex justify-end gap-3 pt-4">
                              <button
                                onClick={handleSaveProfile}
                                disabled={saveStatus === 'saving'}
                                className="px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                              >
                                {saveStatus === 'saving' ? (
                                  <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Saving...
                                  </>
                                ) : saveStatus === 'saved' ? (
                                  <>
                                    <CheckCircle2 size={20} />
                                    Saved!
                                  </>
                                ) : (
                                  <>
                                    <Save size={20} />
                                    Save Changes
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-light-border dark:border-dark-border"></div>

                      {/* Security Section */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                          <Lock size={20} />
                          Security Settings
                        </h3>
                        
                        {/* Show different content based on auth provider */}
                        {profileData.provider === 'google' ? (
                          // Google OAuth users - no password change
                          <div className="space-y-6">
                            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                                  <Shield size={24} className="text-blue-600 dark:text-blue-300" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">
                                    Google Account Authentication
                                  </h3>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                    You&apos;re signed in with your Google account. Your password is managed by Google and cannot be changed here.
                                  </p>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                    To update your password, please visit{' '}
                                    <a 
                                      href="https://myaccount.google.com/security" 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="font-semibold underline hover:text-blue-800 dark:hover:text-blue-200"
                                    >
                                      Google Account Security Settings
                                    </a>
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Account Security Info */}
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-start gap-3">
                                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                    Enhanced Security
                                  </h4>
                                  <p className="text-sm text-green-700 dark:text-green-300">
                                    Your account benefits from Google&apos;s advanced security features including two-factor authentication and suspicious activity monitoring.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Connected Account Info */}
                            <div className="p-4 bg-light-bg dark:bg-dark-bg rounded-lg border-2 border-light-border dark:border-dark-border">
                              <h4 className="font-semibold text-light-text dark:text-dark-text mb-3">
                                Connected Account
                              </h4>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                  <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-light-text dark:text-dark-text">
                                    {profileData.email}
                                  </p>
                                  <p className="text-xs text-light-muted dark:text-dark-muted">
                                    Google Account
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Email/Password users - show password change form
                          <div className="space-y-6">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
                              <div className="flex items-start gap-3">
                                <Shield size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    Password Requirements
                                  </h3>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Use at least 8 characters with a mix of letters, numbers, and symbols
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                Current Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showCurrentPassword ? 'text' : 'password'}
                                  value={securityData.currentPassword}
                                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                  className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                                >
                                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                New Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? 'text' : 'password'}
                                  value={securityData.newPassword}
                                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                  className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                                >
                                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                value={securityData.confirmPassword}
                                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                              />
                            </div>

                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}              {/* Notifications & Preferences Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
                    Notifications & Preferences
                  </h2>
                  
                  <div className="space-y-8">
                    {/* Email Notifications Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                        <Mail size={20} className="text-brand-teal" />
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'emailNewFeatures', label: 'New Features & Updates', desc: 'Get notified about new features and major updates' },
                          { key: 'emailTips', label: 'Tips & Tutorials', desc: 'Learn how to get the most out of Personal Academy' },
                          { key: 'emailMarketing', label: 'Marketing & Promotions', desc: 'Special offers and promotional content' },
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-3 p-4 rounded-lg border border-light-border dark:border-dark-border hover:border-brand-teal cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications] as boolean}
                              onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                              className="mt-1 w-5 h-5 rounded border-2 border-light-border dark:border-dark-border text-brand-teal focus:ring-brand-teal"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-light-text dark:text-dark-text">
                                {item.label}
                              </div>
                              <div className="text-sm text-light-muted dark:text-dark-muted">
                                {item.desc}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                        <Bell size={20} className="text-brand-teal" />
                        Push Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'pushCourseComplete', label: 'Course Generation Complete', desc: 'When your storyboard is ready' },
                          { key: 'pushCreditsLow', label: 'Low Credits Alert', desc: 'When your credit balance is running low' },
                          { key: 'pushReferrals', label: 'Referral Rewards', desc: 'When you earn referral bonuses' },
                        ].map((item) => (
                          <label key={item.key} className="flex items-start gap-3 p-4 rounded-lg border border-light-border dark:border-dark-border hover:border-brand-teal cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications] as boolean}
                              onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                              className="mt-1 w-5 h-5 rounded border-2 border-light-border dark:border-dark-border text-brand-teal focus:ring-brand-teal"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-light-text dark:text-dark-text">
                                {item.label}
                              </div>
                              <div className="text-sm text-light-muted dark:text-dark-muted">
                                {item.desc}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-light-border dark:border-dark-border"></div>

                    {/* Application Preferences Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                        <Globe size={20} className="text-brand-teal" />
                        Application Preferences
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                            Timezone
                          </label>
                          <select
                            value={preferences.timezone}
                            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                          >
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Asia/Kolkata">India (IST)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                            Date Format
                          </label>
                          <select
                            value={preferences.dateFormat}
                            onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                            Default Export Format
                          </label>
                          <select
                            value={preferences.defaultExportFormat}
                            onChange={(e) => setPreferences({ ...preferences, defaultExportFormat: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                          >
                            <option value="pdf">PDF</option>
                            <option value="pptx">PowerPoint (PPTX)</option>
                            <option value="docx">Word (DOCX)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={handleSaveNotifications}
                        disabled={saveStatus === 'saving'}
                        className="px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {saveStatus === 'saving' ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Saving...
                          </>
                        ) : saveStatus === 'saved' ? (
                          <>
                            <CheckCircle2 size={20} />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            Save All Preferences
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
                    Account Management
                  </h2>
                  <div className="space-y-6">
                    
                    {/* Subscription Info */}
                    <div className="p-6 rounded-lg border-2 border-brand-teal bg-brand-teal/5">
                      <div className="flex items-start gap-3">
                        <CreditCard size={24} className="text-brand-teal mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                            {deletionStatus?.credits?.isPremium ? 'Premium Plan' : 'Credits Plan'}
                          </h3>
                          <p className="text-sm text-light-muted dark:text-dark-muted mb-2">
                            You have <span className="font-bold text-brand-teal">{deletionStatus?.credits?.balance?.toLocaleString() || 0} credits</span> remaining.
                          </p>
                          
                          {deletionStatus?.credits && deletionStatus.credits.expiringAmount > 0 && deletionStatus.credits.daysUntilExpiry !== null && (
                            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                              <p className="text-sm text-orange-700 dark:text-orange-300">
                                ⚠️ <span className="font-semibold">{deletionStatus.credits.expiringAmount} credits</span> will expire in{' '}
                                <span className="font-bold">{deletionStatus.credits.daysUntilExpiry} {deletionStatus.credits.daysUntilExpiry === 1 ? 'day' : 'days'}</span>
                              </p>
                            </div>
                          )}
                          
                          <button
                            onClick={() => router.push('/account/pricing')}
                            className="px-4 py-2 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-medium transition-all"
                          >
                            Buy More Credits
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="p-6 rounded-lg border border-light-border dark:border-dark-border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <LogOut size={24} className="text-light-muted dark:text-dark-muted mt-1" />
                          <div>
                            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                              Logout
                            </h3>
                            <p className="text-sm text-light-muted dark:text-dark-muted">
                              Sign out of your account on this device
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border rounded-lg hover:border-brand-teal transition-all font-medium"
                        >
                          Logout
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    {deletionStatus?.accountStatus === 'pending_deletion' ? (
                      // Show cancellation option if deletion is scheduled
                      <div className="p-6 rounded-lg border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
                        <div className="flex items-start gap-3">
                          <Clock size={24} className="text-orange-600 dark:text-orange-400 mt-1" />
                          <div className="flex-1 space-y-3">
                            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                              Account deletion scheduled
                            </h3>
                            <p className="text-sm text-orange-700 dark:text-orange-200">
                              Your account is queued for deletion
                              {deletionStatus?.deletionDate
                                ? ` on ${new Date(deletionStatus.deletionDate).toLocaleDateString()}`
                                : '.'}
                            </p>
                            {typeof deletionStatus?.daysUntilDeletion === 'number' && (
                              <p className="text-xs text-orange-700 dark:text-orange-300">
                                {deletionStatus.daysUntilDeletion > 0
                                  ? `${deletionStatus.daysUntilDeletion} day${deletionStatus.daysUntilDeletion === 1 ? '' : 's'} remaining in the grace period.`
                                  : 'Deletion will be processed soon.'}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={handleCancelDeletion}
                              disabled={saveStatus === 'saving'}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-orange-700 font-semibold border border-orange-300 hover:bg-orange-100 transition-all disabled:opacity-60"
                            >
                              {saveStatus === 'saving' ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Cancelling…
                                </>
                              ) : (
                                <>
                                  <X size={16} />
                                  Cancel deletion request
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Warning */}
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
                          <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                            ⚠️ This action will permanently delete your account after a 30-day grace period
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            You will have 30 days to cancel this request. After that, all data will be permanently deleted.
                          </p>
                        </div>

                        {/* What will be deleted */}
                        <div>
                          <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">
                            The following will be permanently deleted after 30 days:
                          </h3>
                          <ul className="space-y-2 text-sm text-light-muted dark:text-dark-muted">
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>All courses, lessons, modules, and AI-generated content</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>All unused credits (non-refundable)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>Credits transaction history</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>Referral data and earnings</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>File uploads and exported materials</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>Account profile and settings</span>
                            </li>
                          </ul>
                        </div>

                        {/* What will be retained */}
                        <div>
                          <h3 className="font-semibold text-light-text dark:text-dark-text mb-3">
                            What will be retained (for legal compliance):
                          </h3>
                          <ul className="space-y-2 text-sm text-light-muted dark:text-dark-muted">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>Payment transaction records (7 years - Indian Income Tax Act requirement)</span>
                            </li>
                          </ul>
                        </div>

                        {/* Data Retention Timeline */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                            Data Retention Policy
                          </h4>
                          <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                            <p><strong>Grace Period:</strong> 30 days to cancel deletion request</p>
                            <p><strong>User Data:</strong> Retained for 6 months after account deletion</p>
                            <p><strong>Payment Records:</strong> Retained for 7 years (tax compliance)</p>
                            <p><strong>Cancellation:</strong> Can be done anytime during grace period from this page</p>
                          </div>
                        </div>

                        {/* Email confirmation */}
                        <div>
                          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                            To confirm, type your email address: <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={deleteConfirmEmail}
                            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                            placeholder={profileData.email}
                            className="w-full px-4 py-2 border-2 border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                          />
                          <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                            Must match your account email exactly
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => {
                                                    setDeleteConfirmEmail('')
                            }}
                            className="flex-1 px-4 py-2 bg-light-bg dark:bg-dark-bg border-2 border-light-border dark:border-dark-border rounded-lg hover:border-brand-teal transition-all font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleRequestDeletion}
                            disabled={saveStatus === 'saving' || !deleteConfirmEmail}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saveStatus === 'saving' ? 'Scheduling...' : 'Delete My Account'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
