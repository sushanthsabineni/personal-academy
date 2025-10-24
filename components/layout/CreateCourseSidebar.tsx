'use client'

// React
import { useState } from 'react'

// Next.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// External libraries
import { ChevronLeft, ChevronRight, BookOpen, Image as ImageIcon, Layers, Film, Edit3, Eye, Rocket, Lock } from '@/lib/icons'

export function CreateCourseSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const steps = [
    { id: 1, label: 'Course Info', icon: BookOpen, href: '/create/essentials' },
    { id: 2, label: 'Multimedia', icon: ImageIcon, href: '/create/multimedia' },
    { id: 3, label: 'Modules', icon: Layers, href: '/create/modules' },
    { id: 4, label: 'Storyboard', icon: Film, href: '/create/storyboard' },
  ]

  const comingSoon = [
    { id: 5, label: 'Course Developer', icon: Edit3, href: '/coming-soon' },
    { id: 6, label: 'SME Review', icon: Eye, href: '/coming-soon' },
    { id: 7, label: 'Publish', icon: Rocket, href: '/coming-soon' },
  ]

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 z-40 overflow-y-auto ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-4 top-4 p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-md"
      >
        {isOpen ? (
          <ChevronLeft size={18} className="text-brand-teal" />
        ) : (
          <ChevronRight size={18} className="text-brand-teal" />
        )}
      </button>

      {/* Sidebar Content */}
      <div className="p-4">
        {/* Progress */}
        {isOpen && (
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              PROGRESS
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Step {steps.findIndex(s => s.href === pathname) + 1} of {steps.length}
            </p>
            <div className="w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-brand-teal rounded-full transition-all duration-300"
                style={{ width: `${((steps.findIndex(s => s.href === pathname) + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Active Steps */}
        <div className="mb-8">
          {isOpen && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Course Creation
            </p>
          )}
          <nav className="space-y-2">
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = pathname === step.href
              return (
                <Link
                  key={step.id}
                  href={step.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${
                      isActive
                        ? 'bg-brand-teal text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }
                  `}
                  title={step.label}
                >
                  <Icon size={20} />
                  {isOpen && <span className="text-sm font-medium">{step.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Coming Soon Section */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
          {isOpen && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Coming Soon
            </p>
          )}
          <nav className="space-y-2">
            {comingSoon.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                  title={item.label}
                >
                  <Icon size={20} />
                  {isOpen && (
                    <>
                      <span className="text-sm font-medium flex-1 text-left">
                        {item.label}
                      </span>
                      <Lock size={14} />
                    </>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
