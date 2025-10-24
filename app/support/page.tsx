'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ContactForm from '@/components/ContactForm'
import { 
  BookOpen, 
  Sparkles, 
  Download, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Clock,
  Shield,
  Mail
} from '@/lib/icons'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function SupportPage() {
  const router = useRouter()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)

  const faqs: FAQItem[] = [
    {
      category: 'Getting Started',
      question: 'How do I create my first course?',
      answer: 'Click "Create New Course" from your dashboard. You\'ll go through 4 simple steps: (1) Enter course details like title and learning objectives, (2) Select multimedia elements (audio, images, videos, quizzes), (3) Review and edit your course modules and lessons, (4) Review the storyboard and export your course in PDF, PowerPoint, or Word format.'
    },
    {
      category: 'Getting Started',
      question: 'Do I need to sign up to use the app?',
      answer: 'Yes, you need to create an account to save and manage your courses. You can sign up using your email or Google account for instant access.'
    },
    {
      category: 'Getting Started',
      question: 'What is the difference between Free and Premium plans?',
      answer: 'Free users can create and save up to 3 courses with all basic features. Premium users get unlimited course storage, priority AI enhancements, advanced export options, and early access to new features.'
    },
    {
      category: 'Course Creation',
      question: 'How long does it take to create a course?',
      answer: 'Most courses can be created in 10-15 minutes. The AI assists you through each step, automatically generating course structure, lessons, and content based on your inputs.'
    },
    {
      category: 'Course Creation',
      question: 'Can I edit my course after creating it?',
      answer: 'Yes! All your courses are automatically saved. You can edit them anytime by clicking the "Edit" button on your course card in the dashboard.'
    },
    {
      category: 'Course Creation',
      question: 'What happens to my course draft if I close the browser?',
      answer: 'Don\'t worry! Your course is auto-saved every 2 seconds as you work. When you return, you can continue right where you left off.'
    },
    {
      category: 'Course Creation',
      question: 'Can I add my own content to the AI-generated course?',
      answer: 'Absolutely! Every module, lesson, and content piece can be edited. The AI provides a starting point, but you have full control to customize everything.'
    },
    {
      category: 'Features',
      question: 'What multimedia elements can I add?',
      answer: 'You can include: Audio scripts for narration, Image prompts for visual content, Video suggestions, Interactive quizzes, and Animation recommendations. These enhance engagement and learning outcomes.'
    },
    {
      category: 'Features',
      question: 'What export formats are supported?',
      answer: 'You can export your course in three formats: PDF (for easy sharing and printing), PowerPoint (for presentations and workshops), and Word (for further editing and customization).'
    },
    {
      category: 'Features',
      question: 'What is the storyboard feature?',
      answer: 'The storyboard (Step 4) gives you a visual overview of your entire course. You can see all modules and lessons, review content, make final edits, and approve sections before exporting.'
    },
    {
      category: 'Account & Billing',
      question: 'How long are my courses stored?',
      answer: 'Completed courses are stored for 90 days. You can see the countdown on your dashboard. Pro tip: Each time you export a course, the 90-day timer resets, so regular exports keep your courses active!'
    },
    {
      category: 'Account & Billing',
      question: 'What happens when I reach the 3-course limit on Free plan?',
      answer: 'Once you have 3 saved courses, you\'ll need to either delete an old course to create a new one, or upgrade to a Premium plan for unlimited storage.'
    },
    {
      category: 'Account & Billing',
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, you can upgrade to Premium anytime from the Pricing page. If you downgrade, your existing courses remain safe, but you\'ll be limited to 3 saved courses going forward.'
    },
    {
      category: 'Account & Billing',
      question: 'How do credits work?',
      answer: 'Credits are used for AI enhancements and advanced features. Free users get limited credits monthly, while Premium users receive generous credit allocations for unlimited course creation.'
    },
    {
      category: 'Technical',
      question: 'Do I need to install any software?',
      answer: 'No! Personal Academy is a web-based application. Just open your browser, log in, and start creating. It works on any device with internet access.'
    },
    {
      category: 'Technical',
      question: 'Which browsers are supported?',
      answer: 'Personal Academy works best on modern browsers: Chrome, Firefox, Safari, and Edge (latest versions). For optimal performance, we recommend using Chrome.'
    },
    {
      category: 'Technical',
      question: 'Can I use the app on mobile devices?',
      answer: 'While the app is accessible on mobile, we recommend using a desktop or laptop for the best course creation experience, especially for editing and reviewing content.'
    },
    {
      category: 'Technical',
      question: 'Is my data secure?',
      answer: 'Yes! We use industry-standard encryption for all data transmission and storage. Your courses and personal information are stored securely and never shared with third parties.'
    }
  ]

  const categories = ['all', 'Getting Started', 'Course Creation', 'Features', 'Account & Billing', 'Technical']

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-teal/10 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-brand-teal" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Support Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about creating amazing courses with Personal Academy
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-brand-teal" />
            Quick Start Guide
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-teal font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Course Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your course title, target audience, and learning objectives
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-teal font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Multimedia</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose elements like audio, images, videos, and quizzes
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-teal font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Review Structure</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Edit modules and lessons generated by our AI
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-teal font-bold text-xl">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Export</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review storyboard and download in PDF, PPT, or Word
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/create/essentials')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Start Creating
            </button>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Creation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our AI generates course structure, modules, and lessons automatically based on your inputs, saving you hours of work.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Auto-Save Technology
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Never lose your work! Every change is automatically saved every 2 seconds as you create.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Multiple Export Formats
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Export to PDF, PowerPoint, or Word format to suit your needs and workflow.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-brand-teal text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {category === 'all' ? 'All Topics' : category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-3 text-left">
                    <span className="text-xs font-semibold text-brand-teal mt-1">
                      {faq.category}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {faq.question}
                    </span>
                  </div>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 py-4 bg-white dark:bg-slate-800">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 mt-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Privacy & Security
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Your data is encrypted and secure. We never share your information with third parties.
              </p>
              <button className="text-sm text-brand-teal hover:underline font-medium">
                Read Privacy Policy →
              </button>
            </div>
          </div>
        </div>

        {/* Contact Support - Two Options */}
        <div className="bg-gradient-to-br from-brand-teal to-brand-cyan rounded-xl shadow-lg p-8 mt-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Get in Touch</h2>
            <p className="text-white/90 text-lg mb-2">
              Need assistance? We&apos;re here to help!
            </p>
            <p className="text-white/75 text-sm mb-8">
              Average response time: 24-48 hours
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@personalacademy.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-teal font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Send Email
              </a>
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-semibold rounded-lg hover:bg-white/20 transition-all hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Fill Out Form
              </button>
            </div>

            <p className="text-white/75 text-sm mt-6">
              Email us at:{' '}
              <a href="mailto:support@personalacademy.com" className="underline hover:text-white font-semibold">
                support@personalacademy.com
              </a>
            </p>
          </div>
        </div>

        {/* Contact Form Modal */}
        <ContactForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
        />

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 dark:text-gray-400 hover:text-brand-teal dark:hover:text-brand-teal transition-colors text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
