'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, adminLogout } from '@/lib/adminAuth'
import {
  getContentModerationQueue,
  approveContent,
  rejectContent,
  flagContent,
  getContentReports,
  type ContentItem,
  type ContentReport
} from '@/lib/adminSystem'
import {
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  AlertTriangle,
  FileText,
  Video,
  MessageCircle,
  Clock,
  User,
  LogOut,
  Search
} from '@/lib/icons'

export default function AdminContentPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'queue' | 'reports'>('queue')
  const [contentQueue, setContentQueue] = useState<ContentItem[]>([])
  const [contentReports, setContentReports] = useState<ContentReport[]>([])
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'flagged'>('pending')
  const [typeFilter, setTypeFilter] = useState<'all' | 'course' | 'lesson' | 'comment' | 'review'>('all')

  useEffect(() => {
    const loadData = async () => {
      const adminStatus = await isAdmin()
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      const [queueData, reportsData] = await Promise.all([
        getContentModerationQueue(),
        getContentReports()
      ])

      setContentQueue(queueData)
      setContentReports(reportsData)
      setMounted(true)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  const handleApproveContent = async (contentId: string) => {
    const success = await approveContent(contentId)
    if (success) {
      const updatedQueue = await getContentModerationQueue()
      setContentQueue(updatedQueue)
      setSelectedContent(null)
    }
  }

  const handleRejectContent = async (contentId: string, reason: string) => {
    const success = await rejectContent(contentId, reason)
    if (success) {
      const updatedQueue = await getContentModerationQueue()
      setContentQueue(updatedQueue)
      setSelectedContent(null)
    }
  }

  const handleFlagContent = async (contentId: string, reason: string) => {
    const success = await flagContent(contentId, reason)
    if (success) {
      const updatedQueue = await getContentModerationQueue()
      setContentQueue(updatedQueue)
      setSelectedContent(null)
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return <FileText className="w-4 h-4" />
      case 'lesson': return <Video className="w-4 h-4" />
      case 'comment': return <MessageCircle className="w-4 h-4" />
      case 'review': return <MessageCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      case 'approved': return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'rejected': return 'bg-red-600/20 text-red-400 border-red-600/30'
      case 'flagged': return 'bg-orange-600/20 text-orange-400 border-orange-600/30'
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'flagged': return <AlertTriangle className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const filteredQueue = contentQueue.filter(item => {
    const authorName = ((item as any).author_name || '').toString()
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         authorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const contentType = ((item as any).content_type || '').toString()
    const matchesType = typeFilter === 'all' || contentType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const filteredReports = contentReports.filter(report => {
    const title = (report as any).reported_content_title || ''
    const reporter = (report as any).reporter_name || ''
    const reason = (report as any).reason || ''
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reason.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading content moderation...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Content Moderation</h1>
            <p className="text-sm text-gray-400">Review and manage platform content</p>
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
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            Moderation Queue ({contentQueue.filter(item => item.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="w-4 h-4 inline-block"><Flag /></span>
            User Reports ({contentReports.length})
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                />
              </div>
            </div>

            {activeTab === 'queue' && (
              <>
                <div className="min-w-32">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected' | 'flagged')}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>
                <div className="min-w-32">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'all' | 'course' | 'lesson' | 'comment' | 'review')}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="course">Courses</option>
                    <option value="lesson">Lessons</option>
                    <option value="comment">Comments</option>
                    <option value="review">Reviews</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'queue' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content List */}
            <div className="space-y-4">
              {filteredQueue.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedContent(item)}
                  className={`bg-slate-800 rounded-xl border p-4 cursor-pointer transition-all hover:scale-102 ${
                    selectedContent?.id === item.id ? 'ring-2 ring-purple-600' : ''
                  } ${getStatusColor(item.status)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getContentTypeIcon(((item as any).content_type || '').toString())}
                      <span className="text-xs font-medium uppercase tracking-wide">
                        {((item as any).content_type || '').toString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-xs font-medium uppercase tracking-wide">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.content}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{(((item as any).author_name || '').toString())}</span>
                    </div>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

              {filteredQueue.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No content found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Content Detail */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              {selectedContent ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{selectedContent.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{(((selectedContent as any).author_name || '').toString())}</span>
                        </div>
                        <span>{new Date(selectedContent.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(selectedContent.status)}`}>
                      {getStatusIcon(selectedContent.status)}
                      {selectedContent.status}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Content</h4>
                    <p className="text-gray-200 whitespace-pre-wrap">{selectedContent.content}</p>
                  </div>

                  {Boolean((selectedContent as any).metadata) && (
                    <div className="bg-slate-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Metadata</h4>
                      <pre className="text-xs text-gray-400 overflow-x-auto">
                        {JSON.stringify((selectedContent as any).metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedContent.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveContent(selectedContent.id)}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:')
                          if (reason) handleRejectContent(selectedContent.id, reason)
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for flagging:')
                          if (reason) handleFlagContent(selectedContent.id, reason)
                        }}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all"
                      >
                        <span className="w-4 h-4 inline-block"><Flag /></span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">Select content to review</h3>
                  <p className="text-gray-500">Click on any item from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Reports Tab */
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-800 rounded-xl border border-slate-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Report on: {(((report as any).reported_content_title || '').toString())}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Reported by: {(((report as any).reporter_name || '').toString())}</span>
                      <span>{new Date(report.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400">
                    {(((report as any).severity || '').toString())}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Reason</h4>
                  <p className="text-gray-200">{report.reason}</p>
                </div>

                {report.description && (
                  <div className="bg-slate-900 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Additional Details</h4>
                    <p className="text-gray-200">{report.description}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Navigate to content moderation queue for this content
                      setActiveTab('queue')
                      setSelectedContent(contentQueue.find(item => item.id === report.content_id) || null)
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                  >
                    Review Content
                  </button>
                  <button
                    onClick={() => {
                      // Mark report as reviewed
                      // This would need a new function in adminSystem.ts
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                  >
                    Mark Reviewed
                  </button>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <span className="w-16 h-16 mx-auto mb-4 text-gray-600 inline-flex items-center justify-center"><AlertTriangle /></span>
                <h3 className="text-lg font-medium text-gray-400 mb-2">No reports found</h3>
                <p className="text-gray-500">User reports will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
