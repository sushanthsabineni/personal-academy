'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAdmin, adminLogout } from '@/lib/adminAuth'
import {
  getSupportTickets,
  updateSupportTicket,
  createSupportTicketMessage,
  getSupportTicketMessages,
  type SupportTicket,
  type SupportTicketMessage
} from '@/lib/adminSystem'
import {
  MessageSquare,
  Search,
  User,
  Clock,
  Send,
  LogOut,
  Mail
} from '@/lib/icons'

export default function AdminSupportPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [ticketMessages, setTicketMessages] = useState<SupportTicketMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const adminStatus = await isAdmin()
      if (!adminStatus) {
        router.push('/admin/login')
        return
      }

      setLoading(true)
      const ticketsData = await getSupportTickets()
      setTickets(ticketsData)
      setMounted(true)
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  const handleViewTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    const messages = await getSupportTicketMessages(ticket.id)
    setTicketMessages(messages)
  }

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    const success = await createSupportTicketMessage(selectedTicket.id, newMessage, 'admin')
    if (success) {
      setNewMessage('')
      const messages = await getSupportTicketMessages(selectedTicket.id)
      setTicketMessages(messages)

      // Update ticket status to in-progress if it was new
      if (selectedTicket.status === 'new') {
        await updateSupportTicket(selectedTicket.id, { status: 'in_progress' as any })
        const updatedTickets = await getSupportTickets()
        setTickets(updatedTickets)
        setSelectedTicket(updatedTickets.find((t: any) => t.id === (selectedTicket as any).id) || null)
      }
    }
  }

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    const success = await updateSupportTicket(ticketId, { status: status as any })
    if (success) {
      const updatedTickets = await getSupportTickets()
      setTickets(updatedTickets)
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(updatedTickets.find((t: any) => t.id === ticketId) || null)
      }
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchQuery ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-600/20 text-blue-400'
      case 'in-progress': return 'bg-yellow-600/20 text-yellow-400'
      case 'waiting': return 'bg-orange-600/20 text-orange-400'
      case 'resolved': return 'bg-green-600/20 text-green-400'
      case 'closed': return 'bg-gray-600/20 text-gray-400'
      default: return 'bg-slate-600/20 text-slate-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600/20 text-red-400'
      case 'high': return 'bg-orange-600/20 text-orange-400'
      case 'medium': return 'bg-yellow-600/20 text-yellow-400'
      case 'low': return 'bg-green-600/20 text-green-400'
      default: return 'bg-slate-600/20 text-slate-400'
    }
  }


  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading support system...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Support System</h1>
            <p className="text-sm text-gray-400">Manage customer support tickets</p>
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Tickets List */}
        <div className="w-1/2 border-r border-slate-700 flex flex-col">
          {/* Filters */}
          <div className="p-6 border-b border-slate-700 bg-slate-800">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border-2 border-slate-700 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="waiting">Waiting</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Loading tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No tickets found
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => handleViewTicket(ticket)}
                    className={`p-4 hover:bg-slate-700/50 cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-slate-700/30 border-r-2 border-purple-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium truncate pr-2">{ticket.subject}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.user_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {ticket.unread_count > 0 && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                          {ticket.unread_count} new
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="flex-1 flex flex-col">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-6 border-b border-slate-700 bg-slate-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedTicket.user_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedTicket.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                      className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-900 text-white text-sm focus:border-purple-600 focus:outline-none"
                    >
                      <option value="new">New</option>
                      <option value="in-progress">In Progress</option>
                      <option value="waiting">Waiting</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300">{selectedTicket.description}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {ticketMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md p-4 rounded-lg ${
                        message.is_admin
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-300'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-2 ${message.is_admin ? 'text-purple-200' : 'text-gray-400'}`}>
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              {selectedTicket.status !== 'closed' && (
                <div className="p-6 border-t border-slate-700 bg-slate-800">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your response..."
                      className="flex-1 h-24 px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <span className="w-16 h-16 mx-auto mb-4 opacity-50 inline-flex items-center justify-center"><MessageSquare /></span>
                <h3 className="text-lg font-medium mb-2">Select a ticket to view</h3>
                <p>Choose a support ticket from the list to view details and respond</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
