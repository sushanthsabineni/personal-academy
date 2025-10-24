'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, HelpCircle, CreditCard, BookOpen, Lock, Settings, Zap } from '@/lib/icons'

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<string[]>(['faq-1-1']) // First item open by default

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const faqCategories = [
    {
      id: 'general',
      title: 'General Questions',
      icon: HelpCircle,
      color: 'blue',
      faqs: [
        {
          id: 'faq-1-1',
          question: 'What is Personal Academy?',
          answer: 'Personal Academy is an AI-powered course generation platform that helps educators, trainers, and content creators build comprehensive, engaging courses in minutes instead of weeks. Our advanced AI technology generates course structures, lesson content, assessments, and more based on your topic and preferences.'
        },
        {
          id: 'faq-1-2',
          question: 'How does Personal Academy work?',
          answer: 'Personal Academy uses a simple 4-step process: (1) Define your course topic and target audience, (2) AI generates a comprehensive course structure, (3) Customize lessons, modules, and assessments, (4) Export your course in multiple formats (PDF, SCORM, DOCX). The entire process is guided and takes just minutes!'
        },
        {
          id: 'faq-1-3',
          question: 'Who is Personal Academy for?',
          answer: 'Personal Academy is perfect for educators, corporate trainers, instructional designers, online course creators, HR professionals, consultants, and anyone who needs to create educational content quickly and efficiently. No technical skills required!'
        },
        {
          id: 'faq-1-4',
          question: 'Do I need technical skills to use Personal Academy?',
          answer: 'No! Personal Academy is designed to be user-friendly and intuitive. If you can describe what you want to teach, our AI can help you create it. No coding, design, or technical expertise required.'
        },
        {
          id: 'faq-1-5',
          question: 'What languages does Personal Academy support?',
          answer: 'Currently, Personal Academy primarily supports English content generation. We\'re working on adding support for multiple languages in future updates. Stay tuned!'
        }
      ]
    },
    {
      id: 'pricing',
      title: 'Pricing & Credits',
      icon: CreditCard,
      color: 'green',
      faqs: [
        {
          id: 'faq-2-1',
          question: 'How does the credit system work?',
          answer: 'Personal Academy uses a credit-based system. Each AI generation (course structure, lesson content, assessments) consumes credits. When you purchase a plan, you receive a specific number of credits. For example: Starter (1,000 credits), Growth (3,000 credits), Scale (5,000 credits). Different operations consume different amounts of credits based on complexity.'
        },
        {
          id: 'faq-2-2',
          question: 'What are the pricing plans?',
          answer: 'We offer three main plans:\n\n• Starter: ₹999 for 1,000 credits\n• Growth: ₹2,699 for 3,000 credits (10% savings)\n• Scale: ₹4,249 for 5,000 credits (15% savings)\n\nAll credits are valid for 365 days from purchase date. Visit our pricing page for detailed comparisons.'
        },
        {
          id: 'faq-2-3',
          question: 'Do credits expire?',
          answer: 'Yes, credits expire 365 days (1 year) after purchase. This ensures our pricing remains fair and sustainable. You\'ll receive email reminders before your credits expire. Unused credits cannot be refunded or transferred.'
        },
        {
          id: 'faq-2-4',
          question: 'What happens to my credits if I cancel?',
          answer: 'If you delete your account or request cancellation, any remaining credits are immediately forfeited and cannot be recovered. We recommend using your credits before canceling or waiting until they expire naturally.'
        },
        {
          id: 'faq-2-5',
          question: 'Can I get a refund?',
          answer: 'No, all sales are final. We have a strict NO REFUNDS policy as stated in our Terms of Service. Credits are consumed immediately upon AI generation and cannot be reversed. Please review our pricing and features carefully before purchasing.'
        },
        {
          id: 'faq-2-6',
          question: 'What payment methods do you accept?',
          answer: 'We accept payments via Razorpay (for customers in India) and Stripe (for international customers). Both processors support credit cards, debit cards, UPI, net banking, and digital wallets. All transactions are PCI DSS compliant and secure.'
        },
        {
          id: 'faq-2-7',
          question: 'Can I purchase more credits if I run out?',
          answer: 'Yes! You can purchase additional credits anytime from your account dashboard. Simply visit the Credits page and choose a plan. Your new credits will be added to your account immediately and will have their own 365-day expiration date.'
        }
      ]
    },
    {
      id: 'course-creation',
      title: 'Course Creation',
      icon: BookOpen,
      color: 'purple',
      faqs: [
        {
          id: 'faq-3-1',
          question: 'How long does it take to create a course?',
          answer: 'Most courses can be created in 15-30 minutes using Personal Academy! The AI generates the structure in seconds, and you spend the remaining time customizing content to your preferences. Traditional course creation can take weeks or months - we reduce that to minutes.'
        },
        {
          id: 'faq-3-2',
          question: 'Can I customize AI-generated content?',
          answer: 'Absolutely! All AI-generated content is fully editable. You can modify titles, descriptions, lesson content, assessments, and any other element. Think of AI as your starting point - you have complete control over the final product.'
        },
        {
          id: 'faq-3-3',
          question: 'What export formats are available?',
          answer: 'Personal Academy supports three export formats:\n\n• PDF: Beautiful formatted document for print or digital distribution\n• SCORM 1.2: Industry-standard package for LMS platforms (Moodle, Canvas, etc.)\n• DOCX: Microsoft Word document for further editing\n\nAll exports maintain professional formatting and include your branding.'
        },
        {
          id: 'faq-3-4',
          question: 'How long can I access my completed courses?',
          answer: 'Completed courses expire 90 days after completion. Before expiration, you can export them in any format as many times as needed. If you need to extend access, simply re-export the course, which resets the 90-day timer. This policy helps us manage storage costs.'
        },
        {
          id: 'faq-3-5',
          question: 'Can I create courses in any subject?',
          answer: 'Yes! Personal Academy can generate courses on virtually any topic - from technical subjects like programming and data science to soft skills like leadership and communication, to academic subjects, professional training, and more. Our AI is trained on a wide knowledge base.'
        },
        {
          id: 'faq-3-6',
          question: 'How many courses can I create?',
          answer: 'There\'s no limit to how many courses you can create, as long as you have credits available. Each course generation consumes credits based on complexity. Free plan users may have course storage limits - check your dashboard for details.'
        },
        {
          id: 'faq-3-7',
          question: 'Can I upload my courses to an LMS?',
          answer: 'Yes! Export your course as SCORM 1.2 and upload it to any SCORM-compliant LMS platform including Moodle, Canvas, Blackboard, TalentLMS, and more. Our SCORM packages are tested with major LMS platforms.'
        }
      ]
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      icon: Zap,
      color: 'orange',
      faqs: [
        {
          id: 'faq-4-1',
          question: 'How does the AI generate courses?',
          answer: 'Our AI uses advanced language models trained on educational content, instructional design principles, and best practices. When you provide a topic, the AI analyzes it, structures a logical learning path, generates relevant content, creates assessments, and formats everything professionally. We do NOT disclose specific model names for competitive reasons.'
        },
        {
          id: 'faq-4-2',
          question: 'Do you train AI on my course content?',
          answer: 'NO. We do NOT train our AI models on your course content. Your data is your data. We value your privacy and intellectual property. All courses you create remain confidential and are never used to train or improve AI models.'
        },
        {
          id: 'faq-4-3',
          question: 'How accurate is AI-generated content?',
          answer: 'Our AI generates high-quality, relevant content based on vast training data. However, AI is not perfect and may occasionally produce errors or outdated information. We STRONGLY RECOMMEND reviewing and fact-checking all AI-generated content before publishing or distributing your courses. You are responsible for content accuracy.'
        },
        {
          id: 'faq-4-4',
          question: 'Can I control the AI generation process?',
          answer: 'Yes! You provide input at each step: target audience, difficulty level, number of modules, lesson depth, assessment types, and more. The AI uses your preferences to tailor content. You can also regenerate any section if you\'re not satisfied with the initial output.'
        },
        {
          id: 'faq-4-5',
          question: 'What if the AI generates inappropriate content?',
          answer: 'While rare, if the AI generates inappropriate, incorrect, or irrelevant content, you can: (1) Regenerate that section, (2) Manually edit the content, or (3) Contact support. We continuously improve our AI to minimize these occurrences. Please report any issues to help us improve.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Security',
      icon: Lock,
      color: 'red',
      faqs: [
        {
          id: 'faq-5-1',
          question: 'Is my data secure?',
          answer: 'Yes! We take security seriously. Your data is stored in Supabase India Region with encryption at rest and in transit. We comply with GDPR, DPDP Act 2023, and CCPA regulations. We use industry-standard security practices and never sell your data to third parties.'
        },
        {
          id: 'faq-5-2',
          question: 'Can I delete my account?',
          answer: 'Yes, you can delete your account anytime from Settings. WARNING: Account deletion is permanent and irreversible. All your courses, credits, and data will be permanently deleted. This cannot be undone. Unused credits are forfeited without refund.'
        },
        {
          id: 'faq-5-3',
          question: 'How do I change my password?',
          answer: 'Go to Account Settings > Security and click "Change Password". You\'ll need to enter your current password and choose a new one. We recommend using a strong, unique password and enabling two-factor authentication for additional security.'
        },
        {
          id: 'faq-5-4',
          question: 'Do you offer two-factor authentication?',
          answer: 'Yes! We highly recommend enabling two-factor authentication (2FA) for additional account security. You can set it up in Account Settings > Security. Once enabled, you\'ll need both your password and a verification code to log in.'
        },
        {
          id: 'faq-5-5',
          question: 'What data do you collect?',
          answer: 'We collect only essential data: email, name, course content you create, usage analytics, and billing information. We do NOT sell your data. For complete details, please read our Privacy Policy and GDPR Compliance pages.'
        },
        {
          id: 'faq-5-6',
          question: 'Can I export my data?',
          answer: 'Yes! Under GDPR and DPDP Act, you have the right to data portability. Contact support at personalacademy1@gmail.com to request a complete export of your personal data. We\'ll provide it in a machine-readable format within 30 days.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: Settings,
      color: 'gray',
      faqs: [
        {
          id: 'faq-6-1',
          question: 'What browsers are supported?',
          answer: 'Personal Academy works best on modern browsers: Chrome, Firefox, Safari, and Edge (latest versions). We recommend keeping your browser updated for the best experience. Some features may not work on older browsers.'
        },
        {
          id: 'faq-6-2',
          question: 'Why is my course export failing?',
          answer: 'Export failures can happen due to: (1) Browser compatibility issues - try a different browser, (2) Large course size - try exporting individual modules, (3) Network interruption - check your connection, (4) Browser pop-up blocker - disable it temporarily. If issues persist, contact support with error details.'
        },
        {
          id: 'faq-6-3',
          question: 'Can I use Personal Academy on mobile?',
          answer: 'While Personal Academy is accessible on mobile devices, we recommend using a desktop or laptop computer for the best experience, especially when creating and editing courses. Mobile support is optimized for browsing and reviewing content.'
        },
        {
          id: 'faq-6-4',
          question: 'How do I report a bug?',
          answer: 'Please email support at personalacademy1@gmail.com with: (1) Description of the bug, (2) Steps to reproduce it, (3) Screenshots if possible, (4) Browser and device information. We appreciate your help in improving Personal Academy!'
        },
        {
          id: 'faq-6-5',
          question: 'Do you have an API?',
          answer: 'Yes! We offer a REST API for programmatic access to course generation features. Visit our API Documentation page for complete details, authentication guides, endpoints, and code examples. API access may require a specific plan.'
        },
        {
          id: 'faq-6-6',
          question: 'How can I get support?',
          answer: 'Support options: (1) Browse our Help Center and FAQ, (2) Check Tutorials for step-by-step guides, (3) Email support at personalacademy1@gmail.com - we respond within 24-48 hours, (4) Review API Documentation for technical integration questions.'
        }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-600 dark:text-blue-400' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700', text: 'text-green-600 dark:text-green-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-600 dark:text-purple-400' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700', text: 'text-orange-600 dark:text-orange-400' },
      red: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-700', text: 'text-red-600 dark:text-red-400' },
      gray: { bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-200 dark:border-gray-700', text: 'text-gray-600 dark:text-gray-400' }
    }
    return colors[color] || colors.blue
  }

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Find answers to common questions about Personal Academy
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-transparent focus:border-green-500 focus:outline-none shadow-lg"
            />
          </div>
          
          {searchQuery && (
            <p className="text-white mt-4">
              {filteredCategories.reduce((acc, cat) => acc + cat.faqs.length, 0)} results found
            </p>
          )}
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No results found for &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
            >
              Clear Search
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const Icon = category.icon
            const colors = getColorClasses(category.color)
            
            return (
              <div key={category.id} className="mb-12">
                {/* Category Header */}
                <div className={`${colors.bg} rounded-xl p-6 mb-6 border ${colors.border}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center">
                      <Icon className={colors.text} size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {category.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.faqs.length} question{category.faqs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                  {category.faqs.map((faq) => {
                    const isOpen = openItems.includes(faq.id)
                    
                    return (
                      <div
                        key={faq.id}
                        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 dark:text-white pr-4">
                            {faq.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="text-gray-500 flex-shrink-0" size={20} />
                          ) : (
                            <ChevronDown className="text-gray-500 flex-shrink-0" size={20} />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}

        {/* Still Have Questions */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can&apos;t find the answer you&apos;re looking for? Check out our other resources or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/help"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-md"
            >
              Visit Help Center
            </Link>
            <Link
              href="/tutorials"
              className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-lg font-semibold transition-all"
            >
              View Tutorials
            </Link>
            <a
              href="mailto:personalacademy1@gmail.com"
              className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-lg font-semibold transition-all"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
