'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCourseSidebar } from '@/components/layout/CreateCourseSidebar'
import { StepNavigation } from '@/components/layout/StepNavigation'
import { Mic, ImageIcon, Video, HelpCircle, Sparkles, Check } from '@/lib/icons'
import { getCurrentDraft, updateCourseProgress } from '@/lib/courseStorage'

export default function CourseStep2() {
  const [courseId, setCourseId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const [selectedOptions, setSelectedOptions] = useState({
    audioScript: false,
    imagePrompts: false,
    videoPrompts: false,
    quiz: false,
    animationNarration: false,
  })

  const [quizOption, setQuizOption] = useState('ai-decide')

  const options = [
    {
      id: 'audioScript',
      icon: Mic,
      title: 'Audio Narration Script',
      description: 'AI-generated voiceover scripts to bring your slides to life',
      badge: 'Recommended',
    },
    {
      id: 'imagePrompts',
      icon: ImageIcon,
      title: 'Image Generation Prompts',
      description: 'Smart keywords and prompts for creating stunning visuals',
      badge: 'Popular',
    },
    {
      id: 'videoPrompts',
      icon: Video,
      title: 'Video Content Prompts',
      description: 'Curated keywords for engaging video elements',
      badge: null,
    },
    {
      id: 'quiz',
      icon: HelpCircle,
      title: 'Knowledge Assessments',
      description: 'Interactive quizzes to reinforce learning',
      badge: 'Essential',
      hasDropdown: true,
    },
    {
      id: 'animationNarration',
      icon: Sparkles,
      title: 'Animation & Motion',
      description: 'Dynamic transitions and animated storytelling elements',
      badge: 'Premium',
    },
  ]

  // Load course ID from current draft
  useEffect(() => {
    const currentDraft = getCurrentDraft()
    if (currentDraft) {
      setCourseId(currentDraft.id)
      // Load saved multimedia selections if available
      // (for now, keep default state)
    }
    setTimeout(() => setIsInitialized(true), 100)
  }, [])

  // Auto-save changes with debounce
  useEffect(() => {
    if (isInitialized && courseId) {
      setHasUnsavedChanges(true)
      
      const saveTimeout = setTimeout(() => {
        updateCourseProgress(courseId, 2, {
          // Save multimedia selections
          // For now, just mark step 2 as visited
        })
        setHasUnsavedChanges(false)
      }, 2000)
      
      return () => clearTimeout(saveTimeout)
    }
  }, [selectedOptions, quizOption, courseId, isInitialized])

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }))
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-slate-900">
      <CreateCourseSidebar />

      {/* Main Content */}
      <main className="flex-1 pl-20 lg:pl-20 pt-6 pb-12 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent">
              Enhance Your Course
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select multimedia elements to make your course more engaging and interactive
            </p>
            {/* Auto-save indicator */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasUnsavedChanges ? 'Saving...' : 'All changes saved'}
              </p>
            </div>
          </div>

          {/* Summary Bar - Moved to Top */}
          <div className="mb-8 p-5 bg-[#4fd1c5] dark:bg-[#4fd1c5] rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/90 mb-1">Elements Selected</p>
                <p className="text-2xl font-bold text-white">
                  {Object.values(selectedOptions).filter(Boolean).length} / {options.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/90 mb-1">Estimated Enhancement</p>
                <p className="text-xl font-semibold text-white">
                  +{Object.values(selectedOptions).filter(Boolean).length * 15}% Engagement
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {options.map((option) => {
              const Icon = option.icon
              const isSelected = selectedOptions[option.id as keyof typeof selectedOptions]
              
              return (
                <div key={option.id} className="group">
                  <div
                    onClick={() => toggleOption(option.id)}
                    className={`
                      relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300
                      ${isSelected
                        ? 'bg-gradient-to-br from-brand-teal/10 to-brand-cyan/10 dark:from-brand-teal/20 dark:to-brand-cyan/20 border-2 border-brand-teal shadow-lg shadow-brand-teal/20'
                        : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-brand-teal/50 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Badge */}
                    {option.badge && (
                      <div className="absolute top-4 right-4">
                        <span className={`
                          px-2 py-1 text-xs font-semibold rounded-full
                          ${option.badge === 'Recommended' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${option.badge === 'Popular' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                          ${option.badge === 'Essential' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                          ${option.badge === 'Premium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                        `}>
                          {option.badge}
                        </span>
                        {/* Quiz Dropdown - Compact, positioned under badge */}
                        {option.hasDropdown && isSelected && (
                          <div className="mt-2">
                            <select
                              value={quizOption}
                              onChange={(e) => setQuizOption(e.target.value)}
                              className="w-32 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-orange-300 dark:border-orange-700 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="every-module">Every module</option>
                              <option value="end-of-course">End of course</option>
                              <option value="pre-post">Pre & post</option>
                              <option value="ai-decide">AI decides</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selection Indicator */}
                    <div className={`
                      absolute top-6 left-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                      ${isSelected
                        ? 'bg-brand-teal border-brand-teal'
                        : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600'
                      }
                    `}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>

                    {/* Content */}
                    <div className="mt-12">
                      {/* Icon */}
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300
                        ${isSelected
                          ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/30'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                        }
                      `}>
                        <Icon size={24} />
                      </div>

                      {/* Title & Description */}
                      <h3 className={`
                        text-lg font-semibold mb-2 transition-colors
                        ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}
                      `}>
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {option.description}
                      </p>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-br from-brand-teal/5 to-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                      ${isSelected ? 'hidden' : ''}
                    `}></div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pro Tip - Moved to Bottom */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl backdrop-blur-sm">
            <p className="text-sm text-blue-900 dark:text-blue-200 text-center">
              <strong>Pro Tip:</strong> Selected elements will be intelligently integrated into each slide based on content context
            </p>
          </div>

          {/* Navigation Buttons */}
          <StepNavigation currentStep={2} />
        </div>
      </main>
    </div>
  )
}
