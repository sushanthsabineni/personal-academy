'use client'

// React
import { useState, useEffect } from 'react'

// External libraries
import { Download, ChevronDown, Edit2, Wand2, X, Menu, Info, Clock, BarChart3, Target, FileText, Navigation as NavigationIcon, Code, Check, File, Presentation, Lock, Mic, Palette, Sparkles } from '@/lib/icons'

// Internal components
import { CreateCourseSidebar } from '@/components/layout/CreateCourseSidebar'

// Internal utilities
import { getCurrentDraft, updateCourseProgress } from '@/lib/courseStorage'
import { exportToPDF, exportToPPT, exportToWord } from '@/lib/exportUtils'
import { trackExport, trackCourseCreateComplete } from '@/lib/analytics'

// Types
interface Slide {
  id: number
  moduleId: number
  lessonId: number
  slideNumber: number
  title: string
  learningObjective: string
  content: string
  mediaNotes: string
  interactionType: string
  assessmentType: string
  color: string
  narration?: string
  aiNotes?: string
  duration?: number // Duration in minutes
  engagementScore?: number // Score from 0-100
}

interface Lesson {
  id: number
  title: string
  description: string
  slides: Slide[]
}

interface Module {
  id: number
  title: string
  description: string
  lessons: Lesson[]
}

// Mock Data Generator
const generateMockData = (): Module[] => [
  {
    id: 1,
    title: 'Fundamentals',
    description: 'Introduction to core concepts and foundational knowledge',
    lessons: [
      {
        id: 1,
        title: 'Getting Started',
        description: 'Learn the basics and set up your foundation',
        slides: [
          {
            id: 1,
            moduleId: 1,
            lessonId: 1,
            slideNumber: 1,
            title: 'Welcome to the Course',
            learningObjective: 'Understand course objectives and expectations',
            content: 'Introduction slide with course overview, instructor info, and what learners will achieve.',
            mediaNotes: 'Background image, course title animation',
            interactionType: 'Navigation',
            assessmentType: 'None',
            color: '#FF6B6B',
            narration: 'Welcome to our comprehensive course...',
            duration: 2,
            engagementScore: 75,
          },
          {
            id: 2,
            moduleId: 1,
            lessonId: 1,
            slideNumber: 2,
            title: 'Learning Objectives',
            learningObjective: 'Identify key learning goals for the course',
            content: 'Bulleted list of learning outcomes (3-5 objectives). Each objective uses action verbs.',
            mediaNotes: 'Icon animations for each objective',
            interactionType: 'Information',
            assessmentType: 'None',
            color: '#FFA94D',
            narration: 'By the end of this course, you will be able to...',
            duration: 3,
            engagementScore: 82,
          },
        ],
      },
      {
        id: 2,
        title: 'Key Concepts',
        description: 'Deep dive into essential terminology and principles',
        slides: [
          {
            id: 3,
            moduleId: 1,
            lessonId: 2,
            slideNumber: 3,
            title: 'Core Terminology',
            learningObjective: 'Define key terms used throughout the course',
            content: 'Interactive glossary with term definitions. Click-to-reveal interactions.',
            mediaNotes: 'Hover effects on terms, definition tooltips',
            interactionType: 'Interactive',
            assessmentType: 'Knowledge Check',
            color: '#FFD43B',
            narration: 'Let&apos;s define the key terminology...',
            duration: 5,
            engagementScore: 91,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Core Skills',
    description: 'Develop practical skills through guided practice',
    lessons: [
      {
        id: 3,
        title: 'Skill Overview',
        description: 'Comprehensive introduction to core skills',
        slides: [
          {
            id: 4,
            moduleId: 2,
            lessonId: 3,
            slideNumber: 4,
            title: 'Skill Framework',
            learningObjective: 'Understand the skill structure and progression',
            content: 'Visual framework showing skill hierarchy, prerequisites, and progression path.',
            mediaNotes: 'Interactive diagram, animated connections',
            interactionType: 'Interactive',
            assessmentType: 'None',
            color: '#51CF66',
            narration: 'Here&apos;s how these skills build upon each other...',
          },
        ],
      },
    ],
  },
]

export default function CourseStep4() {
  const [modules, setModules] = useState<Module[]>(generateMockData())
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(generateMockData()[0].lessons[0].slides[0])
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([1]))
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set([1]))
  const [approvedModules, setApprovedModules] = useState<Set<number>>(new Set())
  const [courseId, setCourseId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ moduleId: number; lessonId: number } | null>(null)
  const [showAIEnhance, setShowAIEnhance] = useState(false)
  const [aiNotes, setAiNotes] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Load course ID from current draft on mount
  useEffect(() => {
    const currentDraft = getCurrentDraft()
    // Use setTimeout to avoid triggering cascading renders
    setTimeout(() => {
      if (currentDraft) {
        setCourseId(currentDraft.id)
      }
      setIsInitialized(true)
    }, 0)
  }, [])

  // Auto-save changes with debounce
  useEffect(() => {
    if (!isInitialized || !courseId || modules.length === 0) return
    
    // Debounce the save operation
    const saveTimeout = setTimeout(() => {
      updateCourseProgress(courseId, 4, {
        storyboard: modules
      })
      setHasUnsavedChanges(false)
    }, 2000)
    
    // Mark as having unsaved changes (after setting up the timeout)
    const changeTimeout = setTimeout(() => setHasUnsavedChanges(true), 0)
    
    return () => {
      clearTimeout(saveTimeout)
      clearTimeout(changeTimeout)
    }
  }, [modules, selectedSlide, editingSlide, approvedModules, courseId, isInitialized])

  const totalSlides = modules.reduce((sum, m) => sum + m.lessons.reduce((ls, l) => ls + l.slides.length, 0), 0)

  const exportOptions = [
    { label: 'PDF Document', icon: <File size={20} />, value: 'pdf' },
    { label: 'PowerPoint Presentation', icon: <Presentation size={20} />, value: 'ppt' },
    { label: 'Word Document', icon: <FileText size={20} />, value: 'word' },
    { label: 'SCORM 1.2 (Coming Soon)', icon: <Lock size={20} />, value: 'scorm', disabled: true },
  ]

  const [feedbackText, setFeedbackText] = useState('')

  const toggleModule = (id: number) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedModules(newExpanded)
  }

  const toggleLesson = (id: number) => {
    const newExpanded = new Set(expandedLessons)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedLessons(newExpanded)
  }

  const handleSlideClick = (slide: Slide) => {
    setSelectedSlide(slide)
    setEditingSlide(null)
    setShowAIEnhance(false)
  }

  const toggleModuleApproval = (id: number) => {
    const newApproved = new Set(approvedModules)
    if (newApproved.has(id)) {
      newApproved.delete(id)
    } else {
      newApproved.add(id)
    }
    setApprovedModules(newApproved)
  }

  const approveAllModules = () => {
    setApprovedModules(new Set(modules.map(m => m.id)))
  }

  const getCurrentModuleName = () => {
    if (!selectedSlide) return ''
    const foundModule = modules.find(m => m.id === selectedSlide.moduleId)
    return foundModule?.title || ''
  }

  const getCurrentLessonName = () => {
    if (!selectedSlide) return ''
    const foundModule = modules.find(m => m.id === selectedSlide.moduleId)
    const lesson = foundModule?.lessons.find(l => l.id === selectedSlide.lessonId)
    return lesson?.title || ''
  }

  const updateSlideContent = (field: string, value: string) => {
    if (editingSlide) {
      const updated = { ...editingSlide, [field]: value }
      setEditingSlide(updated)
      // Update in modules state
      setModules(modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l => ({
          ...l,
          slides: l.slides.map(s => s.id === editingSlide.id ? updated : s)
        }))
      })))
      setSelectedSlide(updated)
    }
  }

  const updateLessonContent = (moduleId: number, lessonId: number, field: 'title' | 'description', value: string) => {
    setModules(modules.map(m => 
      m.id === moduleId 
        ? { 
            ...m, 
            lessons: m.lessons.map(l => 
              l.id === lessonId ? { ...l, [field]: value } : l
            ) 
          }
        : m
    ))
  }

  const handleLessonAIEnhance = () => {
    alert(`Enhancing lesson with AI...`)
  }

  // Export functions moved to lib/exportUtils.ts for code splitting
  // Heavy libraries (jsPDF, pptxgenjs, docx) are now lazy-loaded only when export is triggered
  // This reduces initial bundle size by ~600KB

  const handleExport = async () => {
    // Check if format is selected
    if (!selectedFormat) {
      alert('Please select an export format.')
      return
    }
    
    // Execute the appropriate export function using lazy-loaded utilities
    try {
      const courseTitle = 'Course Storyboard'
      
      switch (selectedFormat) {
        case 'pdf':
          await exportToPDF(modules, courseTitle)
          trackExport('pdf', 'storyboard')
          break
        case 'ppt':
          await exportToPPT(modules, courseTitle)
          trackExport('ppt', 'storyboard')
          break
        case 'word':
          await exportToWord(modules, courseTitle)
          trackExport('word', 'storyboard')
          break
        default:
          alert('Export format not supported yet.')
          return
      }
      
      // Track course completion
      const totalLessons = modules.reduce((sum, mod) => sum + mod.lessons.length, 0)
      trackCourseCreateComplete({
        courseTitle,
        industry: 'Unknown',
        modulesCount: modules.length,
        lessonsCount: totalLessons
      })
      
      // Mark course as completed and save to dashboard
      if (courseId) {
        updateCourseProgress(courseId, 4, {
          storyboard: modules,
          status: 'completed',
          completedAt: new Date().toISOString()
        })
        // Note: Keep the current draft active so user can continue editing if needed
      }
      
      setShowExportModal(false)
      setShowSummary(true)
      // Reset feedback for next time
      setFeedbackText('')
    } catch (error) {
      console.error('Export error:', error)
      alert('An error occurred during export. Please try again.')
    }
  }

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
      <CreateCourseSidebar />

      {/* Main Content - Responsive margin based on sidebar */}
      <main className="flex-1 pl-20 lg:pl-20 transition-all duration-300 flex flex-col h-full overflow-hidden">
        {/* Header - Fixed */}
        <div className="w-full px-6 py-2 border-b border-light-border dark:border-dark-border flex-shrink-0">
          <div className="max-w-full mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-light-text dark:text-dark-text mb-1">
                Your Storyboard
              </h1>
              <div className="flex items-center gap-3">
                {selectedSlide && (
                  <div className="text-xs text-brand-teal font-medium">
                    {getCurrentModuleName()} → {getCurrentLessonName()} → Slide {selectedSlide.slideNumber}
                  </div>
                )}
                {/* Auto-save indicator */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {hasUnsavedChanges ? 'Saving...' : 'Saved'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mobile Menu Toggle Button - Show only on tablet/mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-light-border dark:hover:bg-dark-border rounded-lg transition-all"
              aria-label="Toggle menu"
            >
              <Menu size={24} className="text-light-text dark:text-dark-text" />
            </button>
          </div>
        </div>          {/* Main Content - 2 Column Layout with Fixed Right Menu */}
          <div className="flex-1 w-full flex overflow-hidden">
            
            {/* LEFT PANEL: Slide Preview & Details - Scrollable */}
            {selectedSlide ? (
              <div className="flex-1 overflow-y-auto px-6">
                <div className="max-w-4xl mx-auto py-6">
                
                {/* Single Unified Storyboard Card */}
                <div className="bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border overflow-hidden shadow-lg">
                  
                  {/* Slide Header */}
                  <div
                    className="h-20 w-full flex items-center justify-between px-6 text-white"
                    style={{ backgroundColor: '#14B8A6' }}
                  >
                    <div>
                      <div className="text-sm font-medium opacity-90">SLIDE {selectedSlide.slideNumber}</div>
                      <h2 className="text-xl font-bold">{selectedSlide.title}</h2>
                    </div>
                    <button
                      onClick={() => setEditingSlide(editingSlide?.id === selectedSlide.id ? null : selectedSlide)}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center gap-1.5 transition-all"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                  </div>

                  {/* Slide Metrics Bar */}
                  <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center gap-6">
                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedSlide.duration || 3} min
                          </p>
                        </div>
                        {/* Duration Tooltip Icon */}
                        <div className="relative group">
                          <Info size={14} className="text-gray-400 dark:text-gray-500 cursor-help" />
                          {/* Tooltip - appears below */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-50 pointer-events-none">
                            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg py-2.5 px-3 shadow-xl w-64">
                              <div className="flex items-center gap-1.5 font-semibold mb-1.5">
                                <Clock size={12} />
                                Duration Calculation
                              </div>
                              <p className="mb-2">Estimated based on:</p>
                              <ul className="space-y-1 text-xs leading-relaxed">
                                <li>• Content word count (150 words/min)</li>
                                <li>• Narration length</li>
                                <li>• Interactive elements (+30 sec each)</li>
                                <li>• Media/animations (+15 sec each)</li>
                                <li>• Assessment questions (+45 sec each)</li>
                              </ul>
                              <p className="mt-2 text-xs opacity-75 italic">AI-optimized for learner comprehension</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Score */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <BarChart3 size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Engagement Score</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedSlide.engagementScore || 75}/100
                          </p>
                        </div>
                        {/* Engagement Tooltip Icon */}
                        <div className="relative group">
                          <Info size={14} className="text-gray-400 dark:text-gray-500 cursor-help" />
                          {/* Tooltip - appears below */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-50 pointer-events-none">
                            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg py-2.5 px-3 shadow-xl w-64">
                              <div className="flex items-center gap-1.5 font-semibold mb-1.5">
                                <BarChart3 size={12} />
                                Engagement Score
                              </div>
                              <p className="mb-2">Calculated based on:</p>
                              <ul className="space-y-1 text-xs leading-relaxed">
                                <li>• <strong>Interactivity level</strong> (40%)</li>
                                <li>• <strong>Visual elements</strong> (25%)</li>
                                <li>• <strong>Assessment quality</strong> (20%)</li>
                                <li>• <strong>Content clarity</strong> (15%)</li>
                              </ul>
                              <p className="mt-2 text-xs opacity-75 italic">Higher scores = more engaging content</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unified Content Area */}
                  <div className="p-6 space-y-6">
                  
                    {/* Learning Objective */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                        <Target size={14} className="text-brand-teal" />
                        Learning Objective
                      </label>
                      {editingSlide?.id === selectedSlide.id ? (
                        <textarea
                          value={editingSlide.learningObjective}
                          onChange={(e) => updateSlideContent('learningObjective', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal focus:outline-none"
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">
                          {selectedSlide.learningObjective}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-light-border/50 dark:border-dark-border/50"></div>

                    {/* On-Screen Text / Content */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                        <FileText size={14} className="text-brand-teal" />
                        On-Screen Text / Content
                      </label>
                      {editingSlide?.id === selectedSlide.id ? (
                        <textarea
                          value={editingSlide.content}
                          onChange={(e) => updateSlideContent('content', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal focus:outline-none"
                          rows={4}
                        />
                      ) : (
                        <p className="text-sm text-light-text dark:text-dark-text whitespace-pre-wrap leading-relaxed">
                          {selectedSlide.content}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-light-border/50 dark:border-dark-border/50"></div>

                    {/* Narration / Audio Script */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                        <Mic size={14} className="text-brand-teal" />
                        Narration / Audio Script
                      </label>
                      <p className="text-sm text-light-text dark:text-dark-text italic leading-relaxed">
                        {selectedSlide.narration || 'No narration provided'}
                      </p>
                    </div>

                    <div className="border-t border-light-border/50 dark:border-dark-border/50"></div>

                    {/* Visual Assets & Media */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                        <Palette size={14} className="text-brand-teal" />
                        Visual Assets & Media Notes
                      </label>
                      <p className="text-sm text-light-text dark:text-dark-text leading-relaxed mb-3">
                        {selectedSlide.mediaNotes}
                      </p>
                      <div className="text-xs text-light-muted dark:text-dark-muted space-y-1 pl-4">
                        <p>• Graphics: Infographics, icons, illustrations</p>
                        <p>• Images: Photos, screenshots, diagrams</p>
                        <p>• Animations: Transitions, motion graphics</p>
                      </div>
                    </div>

                    <div className="border-t border-light-border/50 dark:border-dark-border/50"></div>

                    {/* Interactive Elements */}
                    <div>
                      <label className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wide mb-3 block">
                        🖱️ Interactive Components
                      </label>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="bg-light-bg dark:bg-dark-bg p-3 rounded-lg">
                          <p className="text-xs font-medium text-light-muted dark:text-dark-muted mb-1">Interaction Type</p>
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text">{selectedSlide.interactionType}</p>
                        </div>
                        <div className="bg-light-bg dark:bg-dark-bg p-3 rounded-lg">
                          <p className="text-xs font-medium text-light-muted dark:text-dark-muted mb-1">Assessment</p>
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text">{selectedSlide.assessmentType}</p>
                        </div>
                      </div>
                      <div className="text-xs text-light-muted dark:text-dark-muted space-y-1 pl-4">
                        <p>• Clickable elements: Buttons, hotspots, tabs</p>
                        <p>• Quizzes: Multiple choice, drag-and-drop, matching</p>
                        <p>• Simulations: Interactive scenarios, branching</p>
                      </div>
                    </div>

                    <div className="border-t border-light-border/50 dark:border-dark-border/50"></div>

                    {/* Navigation & Flow */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                        <NavigationIcon size={14} className="text-brand-teal" />
                        Navigation & Flow
                      </label>
                      <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">
                        Linear progression to next slide. User can navigate using Next/Previous buttons.
                      </p>
                      <div className="mt-2 text-xs text-light-muted dark:text-dark-muted">
                        Note: Navigation controls appear at bottom of slide
                      </div>
                    </div>

                    <div className="border-t border-light-border/50 dark:border-dark-border/50"></div>

                    {/* Developer Notes */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                        <Code size={14} className="text-brand-teal" />
                        Developer Notes
                      </label>
                      <p className="text-sm text-light-text dark:text-dark-text leading-relaxed mb-3">
                        Build this slide using responsive design. Ensure all interactive elements are keyboard accessible. 
                        Optimize images for web delivery (max 200KB per image).
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                          <p className="text-xs font-medium text-light-muted dark:text-dark-muted mb-1">File Format</p>
                          <p className="text-sm text-light-text dark:text-dark-text">HTML5, SCORM 1.2</p>
                        </div>
                        <div className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                          <p className="text-xs font-medium text-light-muted dark:text-dark-muted mb-1">Compatibility</p>
                          <p className="text-sm text-light-text dark:text-dark-text">All modern browsers</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-light-border/50 dark:border-dark-border/50"></div>

                    <div className="border-t border-light-border/50 dark:border-dark-border/50"></div>

                    {/* AI Enhancement Box */}
                    <div className="bg-brand-teal/5 dark:bg-brand-teal/10 p-4 rounded-lg border border-brand-teal/30">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-brand-teal flex items-center gap-2">
                          <Wand2 size={16} />
                          ENHANCE WITH AI
                        </label>
                        <button
                          onClick={() => setShowAIEnhance(!showAIEnhance)}
                          className="text-xs text-brand-teal hover:text-brand-cyan font-medium"
                        >
                          {showAIEnhance ? 'Close' : 'Open'}
                        </button>
                      </div>
                      {showAIEnhance && (
                        <div className="space-y-2">
                          <textarea
                            value={aiNotes}
                            onChange={(e) => setAiNotes(e.target.value)}
                            placeholder="Describe what you'd like AI to enhance or regenerate on this slide..."
                            className="w-full px-3 py-2 text-sm rounded border border-brand-teal/30 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:border-brand-teal focus:outline-none"
                            rows={3}
                          />
                          <button className="w-full px-3 py-2 text-sm bg-brand-teal hover:bg-brand-cyan text-white rounded font-medium transition-all flex items-center justify-center gap-2">
                            <Wand2 size={16} />
                            Regenerate Slide
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-light-muted dark:text-dark-muted px-6">
                <p>Select a slide to view details</p>
              </div>
            )}

            {/* RIGHT PANEL: Fixed Modules Menu - Full Height */}
            <div className={`
              w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 flex flex-col
              fixed lg:static top-0 right-0 bottom-0 z-40
              transform transition-transform duration-300 ease-in-out
              shadow-2xl lg:shadow-none
              ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
              lg:translate-x-0
              max-w-full md:max-w-md
            `}>
                
              {/* Header with Approve All - Fixed */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Course Modules
                  </h3>
                  {/* Close button - Show only on tablet/mobile */}
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-all"
                    aria-label="Close menu"
                  >
                    <X size={20} className="text-gray-900 dark:text-white" />
                  </button>
                </div>
                
                {/* Buttons side by side */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={approveAllModules}
                    className="px-3 py-2 text-xs bg-brand-teal/10 text-brand-teal border border-brand-teal rounded hover:bg-brand-teal/20 transition-all font-medium flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    Approve All
                  </button>
                  
                  <button
                    onClick={() => setShowExportModal(true)}
                    disabled={approvedModules.size !== modules.length}
                    className="px-3 py-2 text-xs bg-brand-teal hover:bg-brand-cyan text-white font-medium rounded transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={14} />
                    Export
                  </button>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {approvedModules.size} of {modules.length} approved
                </p>
              </div>

              {/* Scrollable Modules List - Flex-1 to fill remaining space */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-3">
                  {modules.map((moduleItem) => (
                    <div key={moduleItem.id} className="border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
                      
                      {/* Module Header */}
                      <div className="bg-light-bg dark:bg-dark-bg">
                        <button
                          onClick={() => toggleModule(moduleItem.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-light-border dark:hover:bg-dark-border transition-all"
                        >
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <input
                                type="checkbox"
                                checked={approvedModules.has(moduleItem.id)}
                                onChange={() => toggleModuleApproval(moduleItem.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 cursor-pointer accent-brand-teal"
                              />
                              <h3 className="font-semibold text-sm text-light-text dark:text-dark-text">
                                {moduleItem.title}
                              </h3>
                            </div>
                            <p className="text-xs text-light-muted dark:text-dark-muted ml-6">
                              {moduleItem.lessons.reduce((sum, l) => sum + l.slides.length, 0)} slides
                            </p>
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-light-muted dark:text-dark-muted transition-transform ${
                              expandedModules.has(moduleItem.id) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Lessons */}
                      {expandedModules.has(moduleItem.id) && (
                        <div className="bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border">
                          {moduleItem.lessons.map((lesson) => (
                            <div key={lesson.id} className="border-t border-light-border dark:border-dark-border first:border-t-0">
                              
                              {/* Lesson Header */}
                              <div className="p-3 hover:bg-light-bg dark:hover:bg-dark-bg transition-all">
                                <div className="flex items-center justify-between mb-2">
                                  <button
                                    onClick={() => toggleLesson(lesson.id)}
                                    className="flex-1 flex items-center gap-2 text-left"
                                  >
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-brand-teal mb-1">LESSON</p>
                                      {editingLesson?.moduleId === moduleItem.id && editingLesson?.lessonId === lesson.id ? (
                                        <input
                                          type="text"
                                          value={lesson.title}
                                          onChange={(e) => updateLessonContent(moduleItem.id, lesson.id, 'title', e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full px-2 py-1 text-xs font-medium bg-gray-50 dark:bg-slate-900 border border-brand-teal rounded text-light-text dark:text-dark-text focus:outline-none"
                                        />
                                      ) : (
                                        <h4 className="font-medium text-xs text-light-text dark:text-dark-text">
                                          {lesson.title}
                                        </h4>
                                      )}
                                    </div>
                                    <ChevronDown
                                      size={14}
                                      className={`text-light-muted dark:text-dark-muted transition-transform flex-shrink-0 ${
                                        expandedLessons.has(lesson.id) ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>
                                </div>
                                
                                {/* Lesson Description (when editing) */}
                                {editingLesson?.moduleId === moduleItem.id && editingLesson?.lessonId === lesson.id && (
                                  <div className="mb-2">
                                    <textarea
                                      value={lesson.description}
                                      onChange={(e) => updateLessonContent(moduleItem.id, lesson.id, 'description', e.target.value)}
                                      rows={2}
                                      className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-slate-900 border border-brand-teal rounded text-gray-600 dark:text-gray-400 focus:outline-none"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingLesson(
                                        editingLesson?.moduleId === moduleItem.id && editingLesson?.lessonId === lesson.id
                                          ? null
                                          : { moduleId: moduleItem.id, lessonId: lesson.id }
                                      )
                                    }}
                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-all flex items-center gap-1"
                                  >
                                    <Edit2 size={10} />
                                    {editingLesson?.moduleId === moduleItem.id && editingLesson?.lessonId === lesson.id ? 'Save' : 'Edit'}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleLessonAIEnhance()
                                    }}
                                    className="px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all flex items-center gap-1 border border-purple-200 dark:border-purple-800"
                                  >
                                    <Sparkles size={10} />
                                    AI
                                  </button>
                                </div>
                              </div>

                              {/* Slides */}
                              {expandedLessons.has(lesson.id) && (
                                <div className="bg-light-bg dark:bg-dark-bg">
                                  {lesson.slides.map((slide) => (
                                    <button
                                      key={slide.id}
                                      onClick={() => handleSlideClick(slide)}
                                      className={`w-full text-left p-2 pl-4 border-l-4 transition-all hover:bg-light-border dark:hover:bg-dark-border ${
                                        selectedSlide?.id === slide.id
                                          ? 'border-brand-teal bg-light-border dark:bg-dark-border'
                                          : 'border-transparent'
                                      }`}
                                    >
                                      <p className="text-xs font-medium text-light-muted dark:text-dark-muted mb-1">
                                        SLIDE {slide.slideNumber}
                                      </p>
                                      <p className="text-xs font-medium text-light-text dark:text-dark-text line-clamp-1">
                                        {slide.title}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
          </div>
        </div>
      </main>

      {/* Backdrop Overlay - Show only on tablet/mobile when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
            setShowExportModal(false)
            setSelectedFormat('')
          }}></div>
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto z-10">
            
            {/* Close Button */}
            <button
              onClick={() => {
                setShowExportModal(false)
                setSelectedFormat('')
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>

            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white pr-8">
              Export Your Storyboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Select your preferred format to download the course content
            </p>

            <div className="space-y-4">
              {/* Format Selection */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Select Export Format *
                </p>
                <div className="space-y-2">
                  {exportOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                        selectedFormat === opt.value
                          ? 'border-brand-teal bg-brand-teal/5'
                          : 'border-gray-300 dark:border-gray-600 hover:border-brand-teal/50'
                      } ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={opt.value}
                        disabled={opt.disabled}
                        checked={selectedFormat === opt.value}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="w-4 h-4 accent-brand-teal disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <span className="text-brand-teal">{opt.icon}</span>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Optional Feedback */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Any suggestions or feedback? <span className="text-gray-500 font-normal">(Optional)</span>
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or feedback with us..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {feedbackText.length}/500 characters
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleExport}
                disabled={!selectedFormat}
                className="w-full px-4 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Export Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT SUMMARY MODAL */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSummary(false)}></div>
          
          {/* Summary Card */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-2 border-brand-teal z-10">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center">
                <Check size={40} className="text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
              Export Successful!
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Your storyboard is ready to download
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Time Spent */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={20} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-purple-900 dark:text-purple-200 uppercase">Time Spent</span>
                </div>
                <p className="text-2xl font-bold text-purple-900 dark:text-white">12 mins</p>
                <p className="text-xs text-purple-700 dark:text-purple-300">Creating your course</p>
              </div>

              {/* Time Saved */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={20} className="text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-900 dark:text-green-200 uppercase">Time Saved</span>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-white">~8 hours</p>
                <p className="text-xs text-green-700 dark:text-green-300">With AI assistance</p>
              </div>

              {/* Modules Generated */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={20} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase">Content Created</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-white">{modules.length} Modules</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{totalSlides} Total Slides</p>
              </div>

              {/* AI Credits Used */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl border border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={20} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 uppercase">AI Credits</span>
                </div>
                <p className="text-2xl font-bold text-amber-900 dark:text-white">250</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">Credits consumed</p>
              </div>
            </div>

            {/* Info Note */}
            <div className="p-4 bg-brand-teal/10 dark:bg-brand-teal/20 rounded-xl border border-brand-teal/30 mb-4">
              <p className="text-sm text-gray-700 dark:text-gray-200 text-center">
                🎉 Your {selectedFormat.toUpperCase()} file will download shortly. Check your downloads folder!
              </p>
            </div>

            {/* 90-Day Retention Notice */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 mb-6">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Course Saved to Dashboard
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mb-2">
                    Your completed course is now available in your Dashboard for <strong>90 days</strong>. 
                    After this period, it will be automatically deleted to save storage space.
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    💡 <strong>Pro tip:</strong> You can edit and re-export your course anytime from the Dashboard. 
                    Each export resets the 90-day countdown, keeping your course active indefinitely!
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSummary(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowSummary(false)
                  setShowExportModal(true)
                }}
                className="flex-1 px-4 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-medium transition-all shadow-md"
              >
                Export Another Format
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
