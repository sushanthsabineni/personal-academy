'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, adminLogout } from '@/lib/adminAuth'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type Announcement
} from '@/lib/adminSystem'
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Send,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Clock
} from '@/lib/icons'

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    target_audience: 'all' as 'all' | 'free' | 'premium',
    scheduled_at: '',
    expires_at: '',
    is_active: true
  })

  useEffect(() => {
    const loadData = async () => {
      const adminStatus = await isAdmin()
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      const announcementsData = await getAnnouncements()
      setAnnouncements(announcementsData)
      setMounted(true)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content')
      return
    }

    const created = await createAnnouncement(
      formData.title,
      formData.content,
      formData.type,
      formData.target_audience,
      formData.scheduled_at || '',
      formData.expires_at || ''
    )

    if (created) {
      const updatedAnnouncements = await getAnnouncements()
      setAnnouncements(updatedAnnouncements)
      setShowCreateModal(false)
      resetForm()
    }
  }

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement || !formData.title || !formData.content) {
      alert('Please fill in title and content')
      return
    }

    const success = await updateAnnouncement((editingAnnouncement as any).id, {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      target_audience: formData.target_audience,
      start_date: formData.scheduled_at || '',
      end_date: formData.expires_at || '',
      is_active: formData.is_active
    })

    if (success) {
      const updatedAnnouncements = await getAnnouncements()
      setAnnouncements(updatedAnnouncements)
      setEditingAnnouncement(null)
      resetForm()
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      await deleteAnnouncement(id)
      const updatedAnnouncements = await getAnnouncements()
      setAnnouncements(updatedAnnouncements)
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    const a = announcement as any
    setFormData({
      title: a.title,
      content: a.content,
      type: a.type,
      target_audience: a.target_audience,
      scheduled_at: a.scheduled_at || '',
      expires_at: a.expires_at || '',
      is_active: a.is_active
    })
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      target_audience: 'all',
      scheduled_at: '',
      expires_at: '',
      is_active: true
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      case 'warning': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      case 'success': return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'error': return 'bg-red-600/20 text-red-400 border-red-600/30'
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Eye className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      default: return <Megaphone className="w-4 h-4" />
    }
  }

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'all': return 'bg-purple-600/20 text-purple-400'
      case 'free': return 'bg-blue-600/20 text-blue-400'
      case 'premium': return 'bg-yellow-600/20 text-yellow-400'
      default: return 'bg-slate-600/20 text-slate-400'
    }
  }

  const isScheduled = (announcement: Announcement) => {
    return announcement.scheduled_at && new Date(announcement.scheduled_at) > new Date()
  }

  const isExpired = (announcement: Announcement) => {
    return announcement.expires_at && new Date(announcement.expires_at) < new Date()
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading announcements...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Announcements</h1>
            <p className="text-sm text-gray-400">Manage platform-wide notifications and messages</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Announcement
            </button>
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
        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-slate-800 rounded-xl border p-6 transition-all hover:scale-105 ${
                getTypeColor(announcement.type)
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getTypeIcon(announcement.type)}
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {announcement.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {announcement.is_active ? (
                    <Eye className="w-4 h-4 text-green-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                  {isScheduled(announcement) && (
                    <span title="Scheduled"><Clock className="w-4 h-4 text-blue-400" /></span>
                  )}
                  {isExpired(announcement) && (
                    <span title="Expired"><AlertTriangle className="w-4 h-4 text-red-400" /></span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2">{announcement.title}</h3>

              {/* Content */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{announcement.content}</p>

              {/* Metadata */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAudienceColor(announcement.target_audience)}`}>
                    {announcement.target_audience === 'all' ? 'All Users' :
                     announcement.target_audience === 'free' ? 'Free Users' : 'Premium Users'}
                  </span>
                </div>

                {announcement.scheduled_at && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {isScheduled(announcement) ? 'Scheduled for' : 'Published'}
                      {' '}
                      {new Date(announcement.scheduled_at).toLocaleString()}
                    </span>
                  </div>
                )}

                {announcement.expires_at && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      Expires {new Date(announcement.expires_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditAnnouncement(announcement)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No announcements yet</h3>
            <p className="text-gray-500">Create your first announcement to communicate with users</p>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingAnnouncement) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => {
            setShowCreateModal(false)
            setEditingAnnouncement(null)
            resetForm()
          }}>
            <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingAnnouncement(null)
                    resetForm()
                  }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                    placeholder="Announcement title..."
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full h-32 px-3 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none resize-none"
                    placeholder="Announcement content..."
                  />
                </div>

                {/* Type and Audience */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'info' | 'warning' | 'success' | 'error'})}
                      className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={formData.target_audience}
                      onChange={(e) => setFormData({...formData, target_audience: e.target.value as 'all' | 'free' | 'premium'})}
                      className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                    >
                      <option value="all">All Users</option>
                      <option value="free">Free Users</option>
                      <option value="premium">Premium Users</option>
                    </select>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Schedule For (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                      className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expires At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                      className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is-active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-600 focus:ring-offset-slate-900"
                  />
                  <label htmlFor="is-active" className="text-sm text-gray-300">
                    Active (visible to users)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingAnnouncement(null)
                      resetForm()
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
      </div>
    </div>
  )
}
