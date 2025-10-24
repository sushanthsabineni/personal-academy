'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Lock, Bell, Globe, Trash2, Save, Eye, EyeOff,
  CheckCircle2, AlertCircle, Shield, CreditCard, LogOut
} from '@/lib/icons'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'account'>('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    company: 'TechCorp',
    jobTitle: 'L&D Manager',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
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
    emailProductUpdates: true,
    emailTips: false,
    emailMarketing: false,
    pushCourseComplete: true,
    pushCreditsLow: true,
    pushReferrals: true,
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    defaultExportFormat: 'pdf',
  })

  const handleSaveProfile = () => {
    setSaveStatus('saving')
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const handleChangePassword = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (securityData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }
    setSaveStatus('saving')
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved')
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const handleSaveNotifications = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const handleSavePreferences = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion requested. You will receive a confirmation email.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    sessionStorage.clear()
    // Use window.location for full page reload
    window.location.href = '/'
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
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
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
                    Profile Information
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={profileData.jobTitle}
                          onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saveStatus === 'saving'}
                        className="px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {saveStatus === 'saving' ? (
                          <>Saving...</>
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
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
                    Security Settings
                  </h2>
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

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={saveStatus === 'saving'}
                        className="px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {saveStatus === 'saving' ? (
                          <>Updating...</>
                        ) : saveStatus === 'saved' ? (
                          <>
                            <CheckCircle2 size={20} />
                            Updated!
                          </>
                        ) : (
                          <>
                            <Lock size={20} />
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
                    Notification Preferences
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text flex items-center gap-2">
                        <Mail size={20} className="text-brand-teal" />
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        {[
                          { key: 'emailNewFeatures', label: 'New Features & Updates', desc: 'Get notified about new features and major updates' },
                          { key: 'emailProductUpdates', label: 'Product Updates', desc: 'Important product changes and improvements' },
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

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={handleSaveNotifications}
                        disabled={saveStatus === 'saving'}
                        className="px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {saveStatus === 'saving' ? (
                          <>Saving...</>
                        ) : saveStatus === 'saved' ? (
                          <>
                            <CheckCircle2 size={20} />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            Save Preferences
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">
                    Application Preferences
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal outline-none"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>

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
                        <option value="scorm">SCORM Package</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={handleSavePreferences}
                        disabled={saveStatus === 'saving'}
                        className="px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {saveStatus === 'saving' ? (
                          <>Saving...</>
                        ) : saveStatus === 'saved' ? (
                          <>
                            <CheckCircle2 size={20} />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save size={20} />
                            Save Preferences
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
                            Credits Plan
                          </h3>
                          <p className="text-sm text-light-muted dark:text-dark-muted mb-4">
                            You have 1,000 credits remaining. Credits never expire.
                          </p>
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
                    <div className="p-6 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={24} className="text-red-600 dark:text-red-400 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                            Danger Zone
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                            Once you delete your account, there is no going back. This will permanently delete your account, all your courses, and usage history.
                          </p>
                          <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                          >
                            <Trash2 size={20} />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
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
