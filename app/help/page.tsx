'use client'

import { useState } from 'react'
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import { Search, BookOpen, CreditCard, Users, MessageCircle, HelpCircle, ChevronRight, Mail, FileText, Zap, Lock, Download, RefreshCw } from '@/lib/icons'

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)

  const helpCategories = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn the basics of Personal Academy',
      articles: [
        { title: 'How to create your first course', link: '/tutorials#first-course' },
        { title: 'Understanding the 4-step process', link: '/tutorials#four-steps' },
        { title: 'Navigating your dashboard', link: '/tutorials#dashboard' },
        { title: 'Account setup and profile', link: '/tutorials#account-setup' }
      ]
    },
    {
      icon: Zap,
      title: 'Course Creation',
      description: 'Master the AI course generator',
      articles: [
        { title: 'Choosing the right course topic', link: '/tutorials#course-topic' },
        { title: 'Generating course structure with AI', link: '/tutorials#ai-structure' },
        { title: 'Customizing lessons and modules', link: '/tutorials#customize-lessons' },
        { title: 'Adding assessments and quizzes', link: '/tutorials#assessments' },
        { title: 'Exporting your course (PDF, SCORM, Word)', link: '/tutorials#exporting' }
      ]
    },
    {
      icon: CreditCard,
      title: 'Billing & Credits',
      description: 'Manage your subscription and credits',
      articles: [
        { title: 'Understanding credit system', link: '/faq#credits' },
        { title: 'How to purchase credits', link: '/account/credits' },
        { title: 'Credit expiration policy (365 days)', link: '/faq#expiration' },
        { title: 'Pricing plans comparison', link: '/pricing' },
        { title: 'Refund policy', link: '/terms-of-service#refunds' },
        { title: 'Payment methods (Razorpay & Stripe)', link: '/faq#payment-methods' }
      ]
    },
    {
      icon: Users,
      title: 'Account Management',
      description: 'Control your account settings',
      articles: [
        { title: 'Update profile information', link: '/account/settings' },
        { title: 'Change password and security', link: '/account/settings#security' },
        { title: 'Manage email preferences', link: '/account/settings#notifications' },
        { title: 'Delete your account', link: '/faq#delete-account' },
        { title: 'Data export and privacy', link: '/trust/privacy' }
      ]
    },
    {
      icon: Download,
      title: 'Exporting Content',
      description: 'Download and use your courses',
      articles: [
        { title: 'Export formats explained (PDF, SCORM, DOCX)', link: '/tutorials#export-formats' },
        { title: 'SCORM upload to LMS platforms', link: '/tutorials#scorm-lms' },
        { title: 'Course expiration (90 days after completion)', link: '/faq#course-expiration' },
        { title: 'Re-exporting to extend access', link: '/faq#re-export' },
        { title: 'Troubleshooting export issues', link: '/faq#export-issues' }
      ]
    },
    {
      icon: Lock,
      title: 'Privacy & Security',
      description: 'Your data protection',
      articles: [
        { title: 'How we protect your data', link: '/trust/privacy#security' },
        { title: 'GDPR compliance', link: '/trust/gdpr' },
        { title: 'Two-factor authentication', link: '/faq#2fa' },
        { title: 'Data retention policies', link: '/trust/privacy#retention' },
        { title: 'Cookie preferences', link: '/trust/cookies' }
      ]
    }
  ]

  const popularArticles = [
    { title: 'How to create your first course', icon: BookOpen, link: '/tutorials#first-course' },
    { title: 'Understanding the credit system', icon: CreditCard, link: '/faq#credits' },
    { title: 'Exporting to SCORM for LMS', icon: Download, link: '/tutorials#scorm-lms' },
    { title: 'What happens when credits expire?', icon: RefreshCw, link: '/faq#expiration' },
    { title: 'How AI generates course content', icon: Zap, link: '/faq#ai-generation' },
    { title: 'Refund policy explained', icon: FileText, link: '/terms-of-service#refunds' }
  ]

  const quickActions = [
    { title: 'Browse Tutorials', icon: BookOpen, link: '/tutorials', color: 'blue' },
    { title: 'Read FAQ', icon: HelpCircle, link: '/faq', color: 'green' },
    { title: 'Contact Support', icon: MessageCircle, link: null, color: 'orange', onClick: () => setIsContactFormOpen(true) }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', hover: 'hover:bg-green-100 dark:hover:bg-green-900/30' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30' }
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Search our knowledge base or browse categories below
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for help articles, tutorials, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 focus:outline-none shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const colors = getColorClasses(action.color)
            const Icon = action.icon
            
            if (action.onClick) {
              return (
                <button
                  key={action.title}
                  onClick={action.onClick}
                  className={`${colors.bg} ${colors.hover} p-6 rounded-xl shadow-md transition-all transform hover:scale-105 text-left w-full`}
                >
                  <Icon className={`${colors.text} mb-3`} size={32} />
                  <h3 className={`font-semibold ${colors.text}`}>{action.title}</h3>
                </button>
              )
            }
            
            return (
              <Link
                key={action.title}
                href={action.link || '/'}
                className={`${colors.bg} ${colors.hover} p-6 rounded-xl shadow-md transition-all transform hover:scale-105`}
              >
                <Icon className={`${colors.text} mb-3`} size={32} />
                <h3 className={`font-semibold ${colors.text}`}>{action.title}</h3>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            📌 Popular Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article) => {
              const Icon = article.icon
              return (
                <Link
                  key={article.title}
                  href={article.link}
                  className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <Icon className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={24} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" size={20} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            📚 Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.title}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <Icon className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {category.description}
                  </p>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article.title}>
                        <Link
                          href={article.link}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 group"
                        >
                          <ChevronRight className="flex-shrink-0 group-hover:translate-x-1 transition-transform" size={16} />
                          <span>{article.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact Support Section */}
        <div id="contact" className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Still need help?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:personalacademy1@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <Mail size={20} />
                Email Support
              </a>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-lg font-semibold transition-all"
              >
                <HelpCircle size={20} />
                View FAQ
              </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              📧 Support Email: <a href="mailto:personalacademy1@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">personalacademy1@gmail.com</a>
              <br />
              ⏱️ Response time: Within 24-48 hours
            </p>
          </div>
        </div>

      </div>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={isContactFormOpen} 
        onClose={() => setIsContactFormOpen(false)} 
      />
    </div>
  )
}
