'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, adminLogout } from '@/lib/adminAuth'
import { getAllUsers, searchUsers, updateUserCredits, type UserProfile } from '@/lib/adminData'
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
  Check
} from '@/lib/icons'

export default function AdminUsersPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'free' | 'premium'>('all')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editCredits, setEditCredits] = useState('')

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/admin/login')
      return
    }

    const allUsers = getAllUsers()
    setUsers(allUsers)
    setFilteredUsers(allUsers)
    setMounted(true)
  }, [router])

  useEffect(() => {
    let filtered = users

    // Apply search filter
    if (searchQuery) {
      filtered = searchUsers(searchQuery)
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(u => 
        filterType === 'premium' ? u.isPremium : !u.isPremium
      )
    }

    setFilteredUsers(filtered)
  }, [searchQuery, filterType, users])

  const handleSaveCredits = (userId: string) => {
    const credits = parseInt(editCredits)
    if (isNaN(credits) || credits < 0) {
      alert('Please enter a valid credit amount')
      return
    }

    const success = updateUserCredits(userId, credits)
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

  const handleLogout = () => {
    adminLogout()
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
            <div className="flex gap-2">
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
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">User</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Plan</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Credits</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Courses</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Joined</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Last Active</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                    {/* User Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
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

                    {/* Last Active */}
                    <td className="py-4 px-6">
                      <div className="text-gray-400 text-sm">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => {
                          setEditingUserId(user.id)
                          setEditCredits(user.credits.toString())
                        }}
                        disabled={editingUserId !== null}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-all"
                      >
                        <Edit className="w-3 h-3" />
                        Edit Credits
                      </button>
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
      </div>
    </div>
  )
}
