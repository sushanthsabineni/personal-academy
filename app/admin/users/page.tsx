'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { isAdmin, adminLogout } from '@/lib/adminAuth'
import { getAllUsers, searchUsers, updateUserCredits, type UserProfile } from '@/lib/adminData'
import { 
  getUserActivityLogs, 
  suspendUser, 
  unsuspendUser, 
  updateUserNotes,
  type UserActivityLog,
} from '@/lib/adminSystem'
import { 
  Search, 
  LogOut, 
  Crown, 
  Mail, 
  Calendar,
  BookOpen,
  Coins,
  Edit,
  X,
  Check,
  Ban,
  CheckCircle,
  Download,
  Eye,
  FileText,
  AlertTriangle,
  Activity
} from '@/lib/icons'

export default function AdminUsersPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'free' | 'premium' | 'suspended'>('all')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editCredits, setEditCredits] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivityLog[]>([])
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [suspensionDays, setSuspensionDays] = useState('30')
  const [userNotes, setUserNotes] = useState<{[key: string]: string}>({})
  const [editingNotesUserId, setEditingNotesUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const adminStatus = await isAdmin()
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      const allUsers = await getAllUsers()
      setUsers(allUsers)
      setFilteredUsers(allUsers)
      setMounted(true)
    }
    
    checkAuth()
  }, [router])

  const handleViewActivity = async (userId: string) => {
    setViewingUserId(userId)
    const logs = await getUserActivityLogs(userId, 50)
    setUserActivity(logs)
  }

  const handleSuspendUser = async () => {
    if (!suspendingUserId || !suspensionReason) {
      alert('Please provide a suspension reason')
      return
    }

    const days = parseInt(suspensionDays)
    const suspendedUntil = new Date()
    suspendedUntil.setDate(suspendedUntil.getDate() + days)
    
    const success = await suspendUser(suspendingUserId, suspensionReason, suspendedUntil.toISOString())
    
    if (success) {
      const updatedUsers = await getAllUsers()
      setUsers(updatedUsers)
      setSuspendingUserId(null)
      setSuspensionReason('')
      setSuspensionDays('30')
    }
  }

  const handleUnsuspendUser = async (userId: string) => {
    if (confirm('Are you sure you want to unsuspend this user?')) {
      const success = await unsuspendUser(userId)
      if (success) {
        const updatedUsers = await getAllUsers()
        setUsers(updatedUsers)
      }
    }
  }

  const handleSaveNotes = async (userId: string) => {
    const notes = userNotes[userId] || ''
    const success = await updateUserNotes(userId, notes)
    if (success) {
      setEditingNotesUserId(null)
      const updatedUsers = await getAllUsers()
      setUsers(updatedUsers)
    }
  }

  const handleBulkAction = async (action: 'suspend' | 'export') => {
    if (selectedUsers.size === 0) {
      alert('Please select users first')
      return
    }

    if (action === 'export') {
      const usersToExport = users.filter(u => selectedUsers.has(u.id))
      const csv = [
        ['ID', 'Name', 'Email', 'Plan', 'Credits', 'Courses', 'Joined', 'Last Active'].join(','),
        ...usersToExport.map(u => [
          u.id,
          u.name,
          u.email,
          u.isPremium ? 'Premium' : 'Free',
          u.credits,
          u.coursesCreated,
          new Date(u.signupDate).toLocaleDateString(),
          new Date(u.lastActive).toLocaleDateString()
        ].join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      setSelectedUsers(new Set())
    }
  }

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
    }
  }

  useEffect(() => {
    const filterUsers = async () => {
      let filtered = users

      // Apply search filter
      if (searchQuery) {
        filtered = await searchUsers(searchQuery)
      }

      // Apply type filter
      if (filterType !== 'all') {
        if (filterType === 'premium') {
          filtered = filtered.filter(u => u.isPremium)
        } else if (filterType === 'free') {
          filtered = filtered.filter(u => !u.isPremium)
        } else if (filterType === 'suspended') {
          filtered = filtered.filter(u => u.accountStatus === 'suspended')
        }
      }

      setFilteredUsers(filtered)
    }
    
    filterUsers()
  }, [searchQuery, filterType, users])

  const handleSaveCredits = async (userId: string) => {
    const credits = parseInt(editCredits)
    if (isNaN(credits) || credits < 0) {
      alert('Please enter a valid credit amount')
      return
    }

    const success = await updateUserCredits(userId, credits)
    if (success) {
      // Update local state
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, credits } : u
      )
      setUsers(updatedUsers)
      setEditingUserId(null)
      setEditCredits('')
    }
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-gray-400">{filteredUsers.length} users</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Filters and Search */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border-2 border-slate-700 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setFilterType('free')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === 'free'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setFilterType('premium')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === 'premium'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
              >
                Premium
              </button>
              <button
                onClick={() => setFilterType('suspended')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === 'suspended'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                }`}
              >
                Suspended
              </button>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="mt-4 p-4 bg-purple-600/10 border border-purple-600/20 rounded-lg flex items-center justify-between">
              <span className="text-white">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('export')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="text-left py-4 px-6">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                      onChange={toggleAllUsers}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900"
                    />
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Plan</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Credits</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Courses</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Joined</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                    {/* Checkbox */}
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900"
                      />
                    </td>

                    {/* User Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <Image 
                            src={user.profilePicture} 
                            alt={user.name} 
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px]">{user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{user.email}</span>
                      </div>
                    </td>

                    {/* Account Status */}
                    <td className="py-4 px-6">
                      {user.accountStatus === 'suspended' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm font-medium">
                            <Ban className="w-4 h-4" />
                            Suspended
                          </span>
                          {user.suspendedUntil && (
                            <div className="text-xs text-gray-500 mt-1">
                              Until {new Date(user.suspendedUntil).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="py-4 px-6">
                      {user.isPremium ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
                          <Crown className="w-4 h-4" />
                          Premium
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-700 text-gray-400 rounded-full text-sm font-medium">
                          Free
                        </span>
                      )}
                    </td>

                    {/* Credits */}
                    <td className="py-4 px-6">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editCredits}
                            onChange={(e) => setEditCredits(e.target.value)}
                            className="w-24 h-8 px-2 rounded border border-slate-600 bg-slate-900 text-white text-sm focus:border-purple-600 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveCredits(user.id)}
                            className="p-1 bg-green-600 hover:bg-green-700 rounded text-white transition-all"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(null)
                              setEditCredits('')
                            }}
                            className="p-1 bg-slate-600 hover:bg-slate-700 rounded text-white transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-medium">{user.credits.toLocaleString()}</span>
                        </div>
                      )}
                    </td>

                    {/* Courses */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        <span>{user.coursesCreated}</span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.signupDate).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewActivity(user.id)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
                          title="View Activity"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUserId(user.id)
                            setEditCredits(user.credits.toString())
                          }}
                          disabled={editingUserId !== null}
                          className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-all"
                          title="Edit Credits"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.accountStatus === 'suspended' ? (
                          <button
                            onClick={() => handleUnsuspendUser(user.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-all"
                            title="Unsuspend User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendingUserId(user.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingNotesUserId(user.id)
                            setUserNotes({...userNotes, [user.id]: user.notes || ''})
                          }}
                          className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-all"
                          title="Edit Notes"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No users found matching your search.
            </div>
          )}
        </div>

        {/* Activity Modal */}
        {viewingUserId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingUserId(null)}>
            <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  User Activity Log
                </h3>
                <button
                  onClick={() => setViewingUserId(null)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {userActivity.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No activity logs found</p>
                ) : (
                  <div className="space-y-3">
                    {userActivity.map((log, index) => (
                      <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-white font-medium">{log.action}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.details && (
                          <pre className="text-sm text-gray-400 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suspend User Modal */}
        {suspendingUserId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSuspendingUserId(null)}>
            <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Suspend User
                </h3>
                <button
                  onClick={() => setSuspendingUserId(null)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Suspension Reason *
                  </label>
                  <textarea
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    className="w-full h-24 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:outline-none"
                    placeholder="Enter reason for suspension..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Suspension Duration (days)
                  </label>
                  <input
                    type="number"
                    value={suspensionDays}
                    onChange={(e) => setSuspensionDays(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:outline-none"
                    min="1"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSuspendUser}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                  >
                    Suspend User
                  </button>
                  <button
                    onClick={() => {
                      setSuspendingUserId(null)
                      setSuspensionReason('')
                      setSuspensionDays('30')
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Notes Modal */}
        {editingNotesUserId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingNotesUserId(null)}>
            <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  User Notes
                </h3>
                <button
                  onClick={() => setEditingNotesUserId(null)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <textarea
                  value={userNotes[editingNotesUserId] || ''}
                  onChange={(e) => setUserNotes({...userNotes, [editingNotesUserId]: e.target.value})}
                  className="w-full h-32 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                  placeholder="Add notes about this user..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveNotes(editingNotesUserId)}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => setEditingNotesUserId(null)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
