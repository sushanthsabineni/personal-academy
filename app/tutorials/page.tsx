'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, BookOpen, Download, Zap, CreditCard, Settings, FileText, Upload, Clock, CheckCircle } from '@/lib/icons'

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Tutorials', count: 15 },
    { id: 'getting-started', name: 'Getting Started', count: 4 },
    { id: 'course-creation', name: 'Course Creation', count: 5 },
    { id: 'ai-features', name: 'AI Features', count: 3 },
    { id: 'export', name: 'Export & LMS', count: 3 }
  ]

  const tutorials = [
    {
      id: 'first-course',
      category: 'getting-started',
      title: 'Creating Your First Course',
      description: 'Complete walkthrough of the 4-step process from topic selection to final export',
      duration: '8 min',
      difficulty: 'Beginner',
      icon: BookOpen,
      steps: [
        'Sign up and log in to Personal Academy',
        'Click "Create Course" from your dashboard',
        'Step 1: Define your course topic and target audience',
        'Step 2: Review and customize AI-generated structure',
        'Step 3: Edit lessons and add assessments',
        'Step 4: Export your course in your preferred format',
        'Success! Your first course is ready'
      ]
    },
    {
      id: 'four-steps',
      category: 'getting-started',
      title: 'Understanding the 4-Step Process',
      description: 'Deep dive into each step of the course creation workflow',
      duration: '12 min',
      difficulty: 'Beginner',
      icon: Zap,
      steps: [
        'Overview of the complete workflow',
        'Step 1: Topic Selection - Best practices for defining clear learning objectives',
        'Step 2: AI Generation - How the AI creates your course structure',
        'Step 3: Customization - Making the course your own',
        'Step 4: Export Options - Choosing the right format for your needs',
        'Tips for efficient course creation'
      ]
    },
    {
      id: 'dashboard',
      category: 'getting-started',
      title: 'Navigating Your Dashboard',
      description: 'Tour of the dashboard features, stats, and course management',
      duration: '5 min',
      difficulty: 'Beginner',
      icon: Settings,
      steps: [
        'Understanding your dashboard stats',
        'Managing your course library',
        'Viewing time saved and AI generations',
        'Checking credit balance and usage',
        'Creating, editing, and deleting courses',
        'Understanding course status (Draft, In Progress, Completed)',
        'Course expiration countdown (90 days)'
      ]
    },
    {
      id: 'account-setup',
      category: 'getting-started',
      title: 'Account Setup and Settings',
      description: 'Configure your profile, notifications, and security settings',
      duration: '6 min',
      difficulty: 'Beginner',
      icon: Settings,
      steps: [
        'Complete your profile information',
        'Upload a profile picture',
        'Configure email notification preferences',
        'Set up two-factor authentication (recommended)',
        'Review privacy and data settings',
        'Connect payment methods',
        'Understand account limits and quotas'
      ]
    },
    {
      id: 'course-topic',
      category: 'course-creation',
      title: 'Choosing the Right Course Topic',
      description: 'Best practices for selecting topics that work well with AI generation',
      duration: '7 min',
      difficulty: 'Intermediate',
      icon: BookOpen,
      steps: [
        'Identifying your target audience and their needs',
        'Selecting topics with clear learning outcomes',
        'Defining appropriate scope and depth',
        'Providing effective context to the AI',
        'Topics that work best with AI generation',
        'Common pitfalls to avoid',
        'Examples of successful course topics'
      ]
    },
    {
      id: 'ai-structure',
      category: 'course-creation',
      title: 'Generating Course Structure with AI',
      description: 'How to get the best results from AI-generated course outlines',
      duration: '10 min',
      difficulty: 'Intermediate',
      icon: Zap,
      steps: [
        'Providing detailed course requirements',
        'Selecting the right number of modules',
        'Choosing appropriate difficulty level',
        'Setting learning objectives',
        'Reviewing AI-generated structure',
        'When to regenerate vs. edit manually',
        'Optimizing credit usage during generation'
      ]
    },
    {
      id: 'customize-lessons',
      category: 'course-creation',
      title: 'Customizing Lessons and Modules',
      description: 'Edit, reorder, and enhance AI-generated course content',
      duration: '15 min',
      difficulty: 'Intermediate',
      icon: FileText,
      steps: [
        'Understanding the lesson editor interface',
        'Editing lesson titles and descriptions',
        'Modifying lesson content and examples',
        'Reordering modules and lessons',
        'Adding or removing sections',
        'Incorporating your own materials',
        'Best practices for maintaining course flow',
        'Saving drafts and tracking changes'
      ]
    },
    {
      id: 'assessments',
      category: 'course-creation',
      title: 'Adding Assessments and Quizzes',
      description: 'Create effective assessments to test learner knowledge',
      duration: '12 min',
      difficulty: 'Intermediate',
      icon: CheckCircle,
      steps: [
        'Types of assessments available',
        'Creating multiple-choice questions',
        'Adding true/false questions',
        'Writing effective question stems',
        'Providing detailed answer explanations',
        'Setting difficulty levels',
        'Distributing assessments throughout course',
        'Grading criteria and feedback'
      ]
    },
    {
      id: 'exporting',
      category: 'export',
      title: 'Exporting Your Course (PDF, SCORM, Word)',
      description: 'Complete guide to all export formats and when to use each',
      duration: '10 min',
      difficulty: 'Beginner',
      icon: Download,
      steps: [
        'Understanding export format options',
        'PDF Export: Professional formatting and use cases',
        'SCORM Export: For LMS platforms',
        'DOCX Export: For further editing in Microsoft Word',
        'Customizing export settings',
        'Troubleshooting export errors',
        'Re-exporting to extend course access (90-day limit)'
      ]
    },
    {
      id: 'export-formats',
      category: 'export',
      title: 'Export Formats Explained',
      description: 'Detailed comparison of PDF, SCORM, and DOCX formats',
      duration: '8 min',
      difficulty: 'Beginner',
      icon: FileText,
      steps: [
        'PDF: Best for printable handouts and digital distribution',
        'SCORM 1.2: Industry standard for LMS integration',
        'DOCX: Editable format for Microsoft Word',
        'File size considerations for each format',
        'Quality and formatting differences',
        'Browser compatibility for exports',
        'Choosing the right format for your audience'
      ]
    },
    {
      id: 'scorm-lms',
      category: 'export',
      title: 'SCORM Upload to LMS Platforms',
      description: 'Step-by-step guide to uploading courses to popular LMS systems',
      duration: '14 min',
      difficulty: 'Intermediate',
      icon: Upload,
      steps: [
        'What is SCORM and why use it?',
        'Exporting your course as SCORM 1.2',
        'Uploading to Moodle: Complete walkthrough',
        'Uploading to Canvas: Step-by-step guide',
        'Uploading to Blackboard',
        'Other SCORM-compliant platforms (TalentLMS, etc.)',
        'Testing your course in the LMS',
        'Common upload errors and fixes',
        'Tracking learner progress in LMS'
      ]
    },
    {
      id: 'ai-generation',
      category: 'ai-features',
      title: 'How AI Generates Course Content',
      description: 'Behind the scenes: Understanding AI course generation',
      duration: '9 min',
      difficulty: 'Intermediate',
      icon: Zap,
      steps: [
        'Overview of AI language models',
        'How AI analyzes your course topic',
        'The structure generation process',
        'Content creation and examples',
        'Assessment and quiz generation',
        'Why AI sometimes makes mistakes',
        'Best practices for prompting the AI',
        'We do NOT train on your content (privacy guarantee)'
      ]
    },
    {
      id: 'ai-tips',
      category: 'ai-features',
      title: 'Getting Better Results from AI',
      description: 'Tips and tricks for optimizing AI-generated content quality',
      duration: '11 min',
      difficulty: 'Advanced',
      icon: Zap,
      steps: [
        'Providing clear, specific course requirements',
        'Using detailed audience descriptions',
        'Setting appropriate complexity levels',
        'Including relevant context and examples',
        'When to regenerate content vs. edit manually',
        'Combining AI generation with human expertise',
        'Iterative refinement strategies',
        'Credit-efficient generation techniques'
      ]
    },
    {
      id: 'credits-usage',
      category: 'ai-features',
      title: 'Managing Credits Efficiently',
      description: 'Optimize credit usage and understand consumption patterns',
      duration: '7 min',
      difficulty: 'Intermediate',
      icon: CreditCard,
      steps: [
        'How credits are consumed',
        'Credit costs for different operations',
        'Monitoring your credit balance',
        'Planning courses to optimize credit usage',
        'When to regenerate vs. edit manually',
        'Purchasing additional credits',
        'Credit expiration policy (365 days)',
        'Referral program for free credits'
      ]
    },
    {
      id: 're-export',
      category: 'export',
      title: 'Course Expiration and Re-exporting',
      description: 'Understand the 90-day expiration and how to extend access',
      duration: '6 min',
      difficulty: 'Beginner',
      icon: Clock,
      steps: [
        'Why courses expire after 90 days',
        'Expiration countdown in your dashboard',
        'What happens when a course expires',
        'Re-exporting to extend access',
        'Best practices for managing course lifecycle',
        'Email reminders before expiration',
        'Archiving vs. deleting old courses'
      ]
    }
  ]

  const filteredTutorials = selectedCategory === 'all' 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'Intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'Advanced': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              📺 Video Tutorials & Guides
            </h1>
            <p className="text-xl text-purple-100">
              Step-by-step guides to master Personal Academy
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-4 overflow-x-auto py-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {categories.find(c => c.id === selectedCategory)?.name || 'All Tutorials'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredTutorials.length} tutorial{filteredTutorials.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => {
            const Icon = tutorial.icon
            return (
              <div
                key={tutorial.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {/* Thumbnail/Icon Area */}
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-8 flex items-center justify-center relative">
                  <Icon className="text-white" size={64} />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="text-purple-600 ml-1" size={32} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(tutorial.difficulty)}`}>
                      {tutorial.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock size={14} />
                      {tutorial.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {tutorial.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {tutorial.description}
                  </p>

                  {/* Steps Preview */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      What you&apos;ll learn:
                    </p>
                    <ul className="space-y-1">
                      {tutorial.steps.slice(0, 3).map((step, idx) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{step}</span>
                        </li>
                      ))}
                      {tutorial.steps.length > 3 && (
                        <li className="text-xs text-gray-500 dark:text-gray-400 italic">
                          + {tutorial.steps.length - 3} more steps...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                    <Play size={18} />
                    Watch Tutorial
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need More Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explore our other resources for comprehensive support
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/help"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-md"
              >
                Help Center
              </Link>
              <Link
                href="/faq"
                className="px-6 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 rounded-lg font-semibold transition-all"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
