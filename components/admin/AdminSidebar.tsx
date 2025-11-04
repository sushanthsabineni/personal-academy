'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { adminLogout } from '@/lib/adminAuth'
import {
  Home,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Zap,
  FileText,
  Bell,
  Lightbulb,
  BookOpen,
  Code,
  CreditCard,
  TrendingUp,
  Shield,
} from '@/lib/icons'

interface MenuItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  description?: string
  subsections?: boolean
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

export default function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core']))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const menuSections: MenuSection[] = [
    {
      title: 'CORE',
      items: [
        {
          label: 'Dashboard',
          href: '/admin/dashboard',
          icon: <Home className="w-5 h-5" />,
          description: 'Main overview and metrics',
        },
        {
          label: 'Analytics',
          href: '/admin/analytics',
          icon: <BarChart3 className="w-5 h-5" />,
          description: 'Revenue, usage, and metrics',
        },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        {
          label: 'Users',
          href: '/admin/users',
          icon: <Users className="w-5 h-5" />,
          description: 'User profiles and accounts',
        },
        {
          label: 'Expenses',
          href: '/admin/expenses',
          icon: <DollarSign className="w-5 h-5" />,
          description: 'Financial tracking',
        },
        {
          label: 'Announcements',
          href: '/admin/announcements',
          icon: <Bell className="w-5 h-5" />,
          description: 'Platform-wide notifications',
        },
        {
          label: 'Support Tickets',
          href: '/admin/support',
          icon: <Shield className="w-5 h-5" />,
          description: 'Customer support issues',
        },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        {
          label: 'Platform Settings',
          href: '/admin/config/platform',
          icon: <Settings className="w-5 h-5" />,
          description: 'General platform config',
        },
        {
          label: 'AI Configuration',
          href: '/admin/settings',
          icon: <Zap className="w-5 h-5" />,
          description: 'AI models and prompts',
        },
        {
          label: 'Pricing Plans',
          href: '/admin/config/pricing',
          icon: <CreditCard className="w-5 h-5" />,
          description: 'Subscription tiers',
        },
        {
          label: 'AI Credits',
          href: '/admin/config/ai-credits',
          icon: <TrendingUp className="w-5 h-5" />,
          description: 'Credit rates and limits',
        },
        {
          label: 'OpenRouter Setup',
          href: '/admin/config/openrouter',
          icon: <Code className="w-5 h-5" />,
          description: 'API configuration',
        },
        {
          label: 'AI Prompts',
          href: '/admin/config/ai-prompts',
          icon: <Lightbulb className="w-5 h-5" />,
          description: 'Customize prompts',
        },
      ],
    },
    {
      title: 'CONTENT & SYSTEM',
      items: [
        {
          label: 'Content Management',
          href: '/admin/content',
          icon: <BookOpen className="w-5 h-5" />,
          description: 'Course content',
        },
        {
          label: 'Activity Logs',
          href: '/admin/logs',
          icon: <FileText className="w-5 h-5" />,
          description: 'Admin and user activities',
        },
        {
          label: 'Notifications',
          href: '/admin/notifications',
          icon: <Bell className="w-5 h-5" />,
          description: 'Notification settings',
        },
        {
          label: 'System Status',
          href: '/admin/system',
          icon: <Shield className="w-5 h-5" />,
          description: 'System information',
        },
      ],
    },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin/login')
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 w-64 overflow-y-auto z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:top-0`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Admin Panel</h2>
              <p className="text-xs text-gray-400">Control Center</p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <nav className="p-4 space-y-2">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title.toLowerCase())}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
              >
                <span>{section.title}</span>
                <span className="text-xs">
                  {expandedSections.has(section.title.toLowerCase()) ? '−' : '+'}
                </span>
              </button>

              {/* Section Items */}
              {expandedSections.has(section.title.toLowerCase()) && (
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavigation(item.href)}
                        title={item.description}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                          active
                            ? 'bg-purple-600/20 border border-purple-500/50 text-purple-400'
                            : 'text-gray-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                        }`}
                      >
                        <div className={active ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}>
                          {item.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className={`text-xs ${active ? 'text-purple-300/70' : 'text-gray-600 group-hover:text-gray-500'}`}>
                            {item.description}
                          </div>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 hover:border-red-600/50 text-red-400 hover:text-red-300 rounded-lg font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Spacer (Desktop) */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  )
}
