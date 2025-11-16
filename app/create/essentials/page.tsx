'use client'

// React
import { useState, useEffect } from 'react'

// Next.js
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// External libraries
import { 
  Wand2, Upload, X, FileText, Sparkles, Users, Target, 
  Clock, BookOpen, Lightbulb, Globe, TrendingUp, Award, Zap,
  CheckCircle2, Brain, Rocket, Info
} from '@/lib/icons'

// Internal components
import { CreateCourseSidebar } from '@/components/layout/CreateCourseSidebar'
import { StepNavigation } from '@/components/layout/StepNavigation'
import { UnsavedChangesModal } from '@/components/course/UnsavedChangesModal'
import { AIModelRecommender } from '@/components/create/AIModelRecommender'

// Internal utilities
import { supabase, checkAuth } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

const AIOutcomesPanel = dynamic(() => import('@/components/create/AIOutcomesPanel'), { ssr: false })

type UploadedFile = {
  id?: string
  name: string
  type: string
  size?: number
  storage_path?: string
  public_url?: string
}

export default function CourseStep1() {

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userCredits, setUserCredits] = useState<number>(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [expandedMethodology, setExpandedMethodology] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    courseTitle: '',
    industry: '',
    targetAudience: '',
    knowledgeLevel: 'Intermediate',
    learningOutcomes: '',
    duration: 30,
    durationUnit: 'minutes',
    approxModules: 'let-ai-decide',
    approxLessonsPerModule: 'let-ai-decide',
    targetLocation: '',
    methodology: 'let-ai-decide',
    additionalInfo: '',
    uploadedFiles: [] as UploadedFile[],
    fileNotes: '',
  })

  // Helper to capitalize first letter
  function capitalizeFirst(str: string | null | undefined) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Track changes - only after initialization
  // Auto-save to DB after 2 seconds of inactivity
  useEffect(() => {
    if (!isInitialized || !courseId || !userId) return
    if (!formData.courseTitle && !formData.targetAudience && !formData.learningOutcomes) return
    const saveTimeout = setTimeout(async () => {
      await (supabase
        .from('courses') as any)
        .update({
          title: formData.courseTitle,
          industry: formData.industry,
          target_audience: formData.targetAudience,
          knowledge_level: formData.knowledgeLevel.toLowerCase() as Database['public']['Tables']['courses']['Row']['knowledge_level'],
          learning_outcomes: formData.learningOutcomes,
          duration: formData.duration,
          instructional_model: formData.methodology,
          target_location: formData.targetLocation,
          file_notes: formData.fileNotes,
          description: formData.additionalInfo,
          current_step: 1,
          status: 'draft',
        } as never)
        .eq('id', courseId)
      setHasUnsavedChanges(false)
    }, 2000)
    const changeTimeout = setTimeout(() => setHasUnsavedChanges(true), 0)
    return () => {
      clearTimeout(saveTimeout)
      clearTimeout(changeTimeout)
    }
  }, [formData, courseId, userId, isInitialized])

  // Fetch user credits on initialization
  useEffect(() => {
    if (!userId) return
    
    const fetchUserCredits = async () => {
      try {
        const { data: profile } = await (supabase
          .from('profiles') as any)
          .select('credits_balance')
          .eq('id', userId)
          .single()
        
        if (profile && typeof profile.credits_balance === 'number') {
          setUserCredits(profile.credits_balance)
        }
      } catch (error) {
        console.error('Failed to fetch user credits:', error)
      }
    }

    fetchUserCredits()
  }, [userId])

  // E-learning methodologies with rich data
  const methodologies = [
    {
      value: 'addie',
      label: 'ADDIE Model',
      icon: Target,
      description: 'Analyze, Design, Develop, Implement, Evaluate',
      color: 'from-blue-500 to-cyan-500',
      tooltip: [
        'Analyze: Define objectives and audience needs',
        'Design: Create storyboard structure and outline',
        'Develop: Use storyboard as development blueprint',
        'Implement: Deploy based on storyboard specifications',
        'Evaluate: Update storyboard based on feedback',
      ],
    },
    {
      value: 'sam',
      label: 'SAM (Successive Approximation Model)',
      icon: Rocket,
      description: 'Iterative rapid prototyping with feedback',
      color: 'from-green-500 to-emerald-500',
      tooltip: [
        'Iterative storyboarding with rapid prototyping',
        'Quick iterations with stakeholder feedback',
        'Prototype directly from storyboard',
        'Refine through multiple cycles',
      ],
    },
    {
      value: 'action_mapping',
      label: 'Action Mapping',
      icon: Lightbulb,
      description: 'Focus on measurable performance goals',
      color: 'from-amber-500 to-orange-500',
      tooltip: [
        'Focus on measurable goals',
        'Include required actions in scenarios',
        'Build activities that support performance',
        'Minimize extraneous information',
        'Emphasize realistic practice',
      ],
    },
    {
      value: 'blooms_taxonomy',
      label: "Bloom's Taxonomy",
      icon: Brain,
      description: 'Align interactions with cognitive levels',
      color: 'from-purple-500 to-pink-500',
      tooltip: [
        'Remember: Multiple choice, matching, recall exercises',
        'Understand: Summarize, explain, classify activities',
        'Apply: Simulations, case studies, demonstrations',
        'Analyze: Compare/contrast, troubleshoot scenarios',
        'Evaluate: Critique, judge, recommend activities',
        'Create: Design, construct, develop projects',
      ],
    },
    {
      value: 'merrills_first_principles',
      label: "Merrill's First Principles",
      icon: BookOpen,
      description: 'Task-centered, activate, demonstrate, apply, integrate',
      color: 'from-red-500 to-rose-500',
      tooltip: [
        'Task/Problem-centered: Real-world scenarios',
        'Activation: Connect to prior knowledge',
        'Demonstration: Show concepts in action',
        'Application: Practice with coaching',
        'Integration: Reflect and transfer to work',
      ],
    },
    {
      value: 'seventy_twenty_ten',
      label: '70-20-10 Learning Model',
      icon: Award,
      description: '70% experiential, 20% social, 10% formal',
      color: 'from-indigo-500 to-purple-500',
      tooltip: [
        '70% Experiential: Simulations, scenarios, on-the-job practice',
        '20% Social: Collaboration, peer feedback, discussions',
        '10% Formal: Traditional content, videos, readings',
      ],
    },
    {
      value: 'let-ai-decide',
      label: 'Let AI decide',
      icon: Sparkles,
      description: 'AI selects model from inputs',
      color: 'from-brand-teal to-brand-cyan',
      tooltip: ['AI will select an appropriate model based on your inputs.'],
    },
  ]

  // Initialize user and course data
  useEffect(() => {
    async function initializeData() {
      const user = await checkAuth()
      if (!user) {
        router.push('/dashboard')
        return
      }
      setUserId(user.id)
      
      // Find latest draft or in-progress course for user
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['draft', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (!courses || courses.length === 0) {
        // Create new course if none exists
        const { data: newCourse } = await (supabase
          .from('courses') as any)
          .insert({
            user_id: user.id,
            title: 'New Course',
            status: 'draft',
            current_step: 1,
          })
          .select()
          .single()
        
        if (newCourse) {
          setCourseId((newCourse as any).id)
        }
        return
      }
      
      const course = courses[0]
      setCourseId((course as any).id)
      
      // Load existing form data from course
      if ((course as any).title) setFormData(prev => ({ ...prev, courseTitle: (course as any).title }))
      if ((course as any).industry) setFormData(prev => ({ ...prev, industry: (course as any).industry }))
      if ((course as any).target_audience) setFormData(prev => ({ ...prev, targetAudience: (course as any).target_audience }))
      if ((course as any).knowledge_level) setFormData(prev => ({ ...prev, knowledgeLevel: (course as any).knowledge_level }))
      if ((course as any).learning_outcomes) setFormData(prev => ({ ...prev, learningOutcomes: (course as any).learning_outcomes }))
      if ((course as any).duration) setFormData(prev => ({ ...prev, duration: (course as any).duration }))
      if ((course as any).instructional_model) setFormData(prev => ({ ...prev, methodology: (course as any).instructional_model }))
      if ((course as any).target_location) setFormData(prev => ({ ...prev, targetLocation: (course as any).target_location }))
      if ((course as any).description) setFormData(prev => ({ ...prev, additionalInfo: (course as any).description }))
      if ((course as any).file_notes) setFormData(prev => ({ ...prev, fileNotes: (course as any).file_notes }))
      
      setIsInitialized(true)
    }
    
    initializeData()
  }, [])

  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    const requiredFields = [
      formData.courseTitle.trim().length >= 5,
      formData.industry.trim().length > 0,
      formData.targetAudience.trim().length > 0,
      formData.learningOutcomes.trim().length >= 20,
    ]
    const completed = requiredFields.filter(Boolean).length
    return Math.round((completed / requiredFields.length) * 100)
  }

  // Validation checks
  const isValid =
    formData.courseTitle.trim().length >= 5 &&
    formData.industry.trim().length > 0 &&
    formData.targetAudience.trim().length > 0 &&
    formData.learningOutcomes.trim().length >= 20 &&
    !!formData.approxModules && !!formData.approxLessonsPerModule &&
    (formData.uploadedFiles.length === 0 || formData.fileNotes.trim().length > 0)

  // Handle file upload: upload to Supabase Storage and persist to file_uploads table
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !courseId) return

    const uploaded: Array<typeof formData.uploadedFiles[number]> = []

    for (const file of Array.from(files)) {
      try {
        const payload = new FormData()
        payload.append('file', file)
        payload.append('courseId', courseId)
        if (formData.fileNotes.trim()) {
          payload.append('fileDescription', formData.fileNotes.trim())
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: payload,
        })

        if (!response.ok) {
          const errorMessage = await response.text()
          console.error('File upload failed:', errorMessage)
          continue
        }

        const body = await response.json()
        if (!body?.success || !body?.file) {
          console.error('Unexpected upload response payload', body)
          continue
        }

        uploaded.push({
          id: body.file.id,
          name: body.file.name ?? file.name,
          type: body.file.type ?? file.type,
          size: body.file.size ?? file.size,
          public_url: body.file.url,
        })
      } catch (err) {
        console.error('Unhandled file upload error', err)
      }
    }

    if (uploaded.length > 0) {
      setFormData((prev) => ({
        ...prev,
        uploadedFiles: [...uploaded, ...prev.uploadedFiles],
      }))
    }
  }

  // Remove uploaded file (delete from storage and DB if persisted)
  const removeFile = async (index: number) => {
    const file = formData.uploadedFiles[index]
    if (!file) return

    if (file.id) {
      try {
        const response = await fetch(`/api/upload?fileId=${file.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          console.error('Failed to delete file via API', await response.text())
          return
        }
      } catch (err) {
        console.error('Error removing file:', err)
        return
      }
    }

    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }))
  }

  // Handle next step
  const handleNext = async () => {
    if (!isValid || !courseId) return
    setHasUnsavedChanges(false)
    setIsLoading(true)
      await (supabase
        .from('courses') as any)
        .update({
          title: formData.courseTitle,
          industry: formData.industry,
          target_audience: formData.targetAudience,
          knowledge_level: formData.knowledgeLevel.toLowerCase() as Database['public']['Tables']['courses']['Row']['knowledge_level'],
          learning_outcomes: formData.learningOutcomes,
          duration: formData.duration,
          instructional_model: formData.methodology,
          target_location: formData.targetLocation,
          file_notes: formData.fileNotes,
          description: formData.additionalInfo,
          current_step: 2,
          status: 'in_progress',
        } as never)
        .eq('id', courseId)
    setTimeout(() => {
      router.push('/create/multimedia')
    }, 800)
  }

  // Handle save and continue
  const handleSaveAndNavigate = async (path: string) => {
    if (courseId) {
      await (supabase
        .from('courses') as any)
        .update({
          title: formData.courseTitle,
          industry: formData.industry,
          target_audience: formData.targetAudience,
          knowledge_level: formData.knowledgeLevel.toLowerCase() as Database['public']['Tables']['courses']['Row']['knowledge_level'],
          learning_outcomes: formData.learningOutcomes,
          duration: formData.duration,
          instructional_model: formData.methodology,
          target_location: formData.targetLocation,
          file_notes: formData.fileNotes,
          description: formData.additionalInfo,
          current_step: 1,
          status: 'draft',
        } as never)
        .eq('id', courseId)
      setHasUnsavedChanges(false)
    }
    router.push(path)
  }

  // Handle discard and navigate
  const handleDiscardAndNavigate = (path: string) => {
    setHasUnsavedChanges(false)
    router.push(path)
  }

  // Warn before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-teal/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Sidebar */}
      <CreateCourseSidebar />

      {/* Main Content */}
      <main
        className="flex-1 pb-12 transition-[padding-left] duration-300 relative z-10"
        style={{ paddingLeft: 'var(--create-sidebar-width, 5rem)' }}
      >
        {/* Premium Header with Progress */}
        <div className="w-full px-6 py-6 border-b border-light-border dark:border-dark-border bg-gradient-to-r from-brand-teal/5 via-purple-500/5 to-blue-500/5 dark:from-brand-teal/10 dark:via-purple-500/10 dark:to-blue-500/10">
          <div className="max-w-full mx-auto">
            {/* Breadcrumb & Step Indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span>Course Creation</span>
                <span className="text-gray-400">/</span>
                <span className="font-semibold text-brand-teal">Step 1: Essential Details</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-brand-teal">1</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">of 5</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="mb-5">
              <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-brand-teal via-brand-cyan to-blue-500 bg-clip-text text-transparent mb-2">
                Essential Course Details
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
                Share your vision and watch AI transform it into an engaging learning experience
              </p>
            </div>

            {/* Progress Bar with Percentage */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-xs font-bold text-brand-teal">{getCompletionPercentage()}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-teal via-brand-cyan to-blue-500 transition-all duration-700 ease-out rounded-full shadow-lg shadow-brand-teal/50"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Auto-save Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className={`w-2 h-2 rounded-full transition-all ${hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {hasUnsavedChanges ? 'Saving...' : 'Saved'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8">
          {/* Collapsible Form Summary Panel */}
          <div className="mb-6">
            <details className="group/summary">
              <summary className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-teal/10 via-purple-500/10 to-blue-500/10 dark:from-brand-teal/20 dark:via-purple-500/20 dark:to-blue-500/20 rounded-xl border border-brand-teal/20 dark:border-brand-teal/30 cursor-pointer hover:border-brand-teal/40 transition-all select-none">
                <span className="text-lg group-open/summary:rotate-90 transition-transform text-brand-teal">▶</span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Form Summary</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {getCompletionPercentage()}% complete • {Object.values(formData).filter(v => v && (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.length > 0 : v)).length} of 13 fields filled
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-teal">
                  <span>View Details</span>
                </div>
              </summary>
              
              <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
                {/* Course Title */}
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${formData.courseTitle.trim().length >= 5 ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>
                    {formData.courseTitle.trim().length >= 5 && '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Course Title</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{formData.courseTitle || 'Not provided'}</p>
                  </div>
                </div>

                {/* Industry */}
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${formData.industry.trim() ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>
                    {formData.industry.trim() && '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Industry</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{formData.industry || 'Not provided'}</p>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${formData.targetAudience.trim() ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>
                    {formData.targetAudience.trim() && '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Target Audience</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{formData.targetAudience || 'Not provided'}</p>
                  </div>
                </div>

                {/* Knowledge Level */}
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${formData.knowledgeLevel ? 'bg-brand-teal/20 text-brand-teal' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>
                    {formData.knowledgeLevel && '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Knowledge Level</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{formData.knowledgeLevel || 'Not selected'}</p>
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${formData.learningOutcomes.length >= 20 ? 'bg-green-500/20 text-green-600' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>
                    {formData.learningOutcomes.length >= 20 && '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Learning Outcomes</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{formData.learningOutcomes || 'Not provided'}</p>
                  </div>
                </div>

                {/* Methodology */}
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${formData.methodology ? 'bg-purple-500/20 text-purple-600' : 'bg-gray-200 dark:bg-slate-700 text-gray-500'}`}>
                    {formData.methodology && '✓'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">Instructional Design Model</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{formData.methodology ? formData.methodology.replace(/_/g, ' ').toUpperCase() : 'Not selected'}</p>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* Responsive Single Column Layout after removing right column */}
          <div className="flex justify-center">
            <div className="w-full max-w-3xl space-y-6">
              {/* Essential Information Card - Premium Styling */}
              <div className="relative group">
                {/* Animated gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/20 via-purple-500/20 to-brand-cyan/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8 transition-all hover:shadow-2xl hover:-translate-y-0.5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-teal to-brand-cyan rounded-xl blur opacity-50 group-hover:opacity-75 transition"></div>
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center shadow-lg">
                        <Rocket size={24} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Essential Information</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">The foundation of your course</p>
                    </div>
                  </div>

                <div className="space-y-6">
                  {/* Course Title */}
                  <div className="relative">
                    <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900 dark:text-white uppercase tracking-wide">
                      <BookOpen size={16} className="text-brand-teal" />
                      <span>Course Title</span>
                      <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-semibold">
                        Required
                      </span>
                      {formData.courseTitle.length >= 5 && (
                        <CheckCircle2 size={16} className="text-green-500 ml-auto" />
                      )}
                      <div className="relative ml-1">
                        <Info 
                          size={16} 
                          className="text-gray-400 hover:text-brand-teal cursor-help transition-colors"
                          onMouseEnter={() => setShowTooltip('courseTitle')}
                          onMouseLeave={() => setShowTooltip(null)}
                        />
                        {showTooltip === 'courseTitle' && (
                          <div className="absolute left-0 top-6 w-64 p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-xl z-50">
                            <strong>Why be specific?</strong> A clear, descriptive title helps AI generate content that matches your exact vision instead of generic material.
                          </div>
                        )}
                      </div>
                    </label>
                    <input
                      type="text"
                      value={formData.courseTitle}
                      onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                      onFocus={() => setFocusedField('courseTitle')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g., Advanced Project Management Strategies"
                      maxLength={100}
                      className={`w-full h-12 px-4 rounded-xl border-2 transition-all ${
                        focusedField === 'courseTitle'
                          ? 'border-brand-teal ring-4 ring-brand-teal/10 scale-[1.01]'
                          : 'border-gray-300 dark:border-slate-600'
                      } bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none`}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.courseTitle.length >= 5 ? '✓ Looking good!' : 'Min 5 characters'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formData.courseTitle.length}/100
                      </span>
                    </div>
                    
                    {/* Contextual Smart Tip */}
                    {focusedField === 'courseTitle' && formData.courseTitle.length > 0 && (
                      <div className="mt-2 p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 flex gap-2">
                        <Lightbulb size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {formData.courseTitle.length < 10 
                            ? 'Keep adding! More specific titles help AI generate better content.' 
                            : formData.courseTitle.length < 20 
                            ? 'Great! This title is descriptive. AI will tailor content accordingly.' 
                            : 'Perfect! This detailed title will guide AI to create highly relevant content.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Industry & Target Audience (2 columns) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900 dark:text-white uppercase tracking-wide">
                        <TrendingUp size={16} className="text-brand-teal" />
                        <span>Industry</span>
                        <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-semibold">
                          Required
                        </span>
                        {formData.industry.length > 0 && (
                          <CheckCircle2 size={16} className="text-green-500 ml-auto" />
                        )}
                        <div className="relative ml-1">
                          <Info 
                            size={16} 
                            className="text-gray-400 hover:text-brand-teal cursor-help transition-colors"
                            onMouseEnter={() => setShowTooltip('industry')}
                            onMouseLeave={() => setShowTooltip(null)}
                          />
                          {showTooltip === 'industry' && (
                            <div className="absolute left-0 top-6 w-64 p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-xl z-50">
                              <strong>Industry matters!</strong> Specifying your industry helps AI use relevant terminology and examples specific to your field.
                            </div>
                          )}
                        </div>
                      </label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        onFocus={() => setFocusedField('industry')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g., Technology"
                        className={`w-full h-12 px-4 rounded-xl border-2 transition-all ${
                          focusedField === 'industry'
                            ? 'border-brand-teal ring-4 ring-brand-teal/10'
                            : 'border-gray-300 dark:border-slate-600'
                        } bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none`}
                      />
                    </div>

                    <div className="relative">
                      <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900 dark:text-white uppercase tracking-wide">
                        <Users size={16} className="text-brand-teal" />
                        <span>Target Audience</span>
                        <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-semibold">
                          Required
                        </span>
                        {formData.targetAudience.length > 0 && (
                          <CheckCircle2 size={16} className="text-green-500 ml-auto" />
                        )}
                        <div className="relative ml-1">
                          <Info 
                            size={16} 
                            className="text-gray-400 hover:text-brand-teal cursor-help transition-colors"
                            onMouseEnter={() => setShowTooltip('targetAudience')}
                            onMouseLeave={() => setShowTooltip(null)}
                          />
                          {showTooltip === 'targetAudience' && (
                            <div className="absolute left-0 top-6 w-64 p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-xl z-50">
                              <strong>Know your learners!</strong> Defining your audience helps AI tailor content complexity and examples to their level and background.
                            </div>
                          )}
                        </div>
                      </label>
                      <input
                        type="text"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        onFocus={() => setFocusedField('targetAudience')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g., Team Leads"
                        className={`w-full h-12 px-4 rounded-xl border-2 transition-all ${
                          focusedField === 'targetAudience'
                            ? 'border-brand-teal ring-4 ring-brand-teal/10'
                            : 'border-gray-300 dark:border-slate-600'
                        } bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none`}
                      />
                    </div>
                  </div>

                  {/* Knowledge Level - Interactive with Descriptions */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-wide">
                      <Award size={16} className="text-brand-teal" />
                      <span>Knowledge Level</span>
                      <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-semibold">
                        Required
                      </span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Beginner', desc: 'No prior experience needed' },
                        { label: 'Intermediate', desc: 'Some foundational knowledge' },
                        { label: 'Advanced', desc: 'Significant expertise required' },
                        { label: 'Mixed Level', desc: 'Accommodates all levels' }
                      ].map((level) => (
                        <button
                          key={level.label}
                          onClick={() => setFormData({ ...formData, knowledgeLevel: level.label })}
                          className={`relative h-auto rounded-xl font-medium text-sm transition-all overflow-hidden group ${
                            formData.knowledgeLevel === level.label
                              ? 'bg-gradient-to-br from-brand-teal to-brand-cyan text-white shadow-lg shadow-brand-teal/30'
                              : 'bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-brand-teal hover:bg-brand-teal/5'
                          }`}
                        >
                          {formData.knowledgeLevel === level.label && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          )}
                          <div className="relative z-10 p-3">
                            <div className="font-semibold">{level.label}</div>
                            <div className={`text-xs mt-1 ${
                              formData.knowledgeLevel === level.label
                                ? 'text-white/90'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {level.desc}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration - Enhanced with Calculator */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-wide">
                      <Clock size={16} className="text-brand-teal" />
                      <span>Expected Duration</span>
                      <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-semibold">
                        Required
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {/* Duration Input */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                          min="1"
                          max="999"
                          className="w-full h-14 px-4 rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 focus:outline-none transition-all text-center font-bold text-lg"
                        />
                      </div>
                      {/* Unit Selector Dropdown */}
                      <div className="col-span-2">
                        <select
                          value={formData.durationUnit}
                          onChange={e => setFormData({ ...formData, durationUnit: e.target.value })}
                          className="w-full h-14 px-4 rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 focus:outline-none text-sm capitalize"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                          <option value="months">Months</option>
                        </select>
                      </div>
                    </div>
                    {/* Duration Calculator Display */}
                    {formData.duration > 0 && (
                      <div className="p-3 rounded-lg bg-gradient-to-r from-brand-teal/10 to-brand-cyan/10 border border-brand-teal/20">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ⏱️ Estimated total content: <span className="font-semibold text-brand-teal">
                            {formData.duration} {formData.durationUnit === 'minutes' ? 'minute' : formData.durationUnit === 'hours' ? 'hour' : formData.durationUnit === 'days' ? 'day' : formData.durationUnit === 'weeks' ? 'week' : 'month'}
                            {formData.duration !== 1 ? 's' : ''}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Approx Number of Modules (Dropdown, mandatory, AI integration) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-wide">
                      <BookOpen size={16} className="text-brand-teal" />
                      <span>Approx Number of Modules</span>
                      <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-semibold">
                        Required
                      </span>
                    </label>
                    <select
                      className={`w-full h-14 px-4 rounded-xl border-2 ${!formData.approxModules ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 focus:outline-none text-sm`}
                      value={formData.approxModules}
                      onChange={e => setFormData({ ...formData, approxModules: e.target.value })}
                      required
                    >
                      <option value="let-ai-decide">Let AI decide</option>
                      <option value="3-5">3 to 5 modules</option>
                      <option value="6-8">6 to 8 modules</option>
                      <option value="8+">More than 8 modules</option>
                    </select>
                  </div>

                  {/* Approx Number of Lessons per Module (Dropdown, mandatory, AI integration) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-4 text-gray-900 dark:text-white uppercase tracking-wide">
                      <Lightbulb size={16} className="text-brand-teal" />
                      <span>Approx Number of Lessons per Module</span>
                      <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-semibold">
                        Required
                      </span>
                    </label>
                    <select
                      className={`w-full h-14 px-4 rounded-xl border-2 ${!formData.approxLessonsPerModule ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 focus:outline-none text-sm`}
                      value={formData.approxLessonsPerModule}
                      onChange={e => setFormData({ ...formData, approxLessonsPerModule: e.target.value })}
                      required
                    >
                      <option value="let-ai-decide">Let AI decide</option>
                      <option value="2-3">2 to 3 lessons</option>
                      <option value="4-5">4 to 5 lessons</option>
                      <option value="6-7">6 to 7 lessons</option>
                    </select>
                  </div>

                </div>
                </div>
              </div>

              {/* Learning Methodology Card - Premium Redesign */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-brand-teal/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative bg-gradient-to-br from-white/95 to-blue-50/95 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8 transition-all hover:shadow-2xl hover:-translate-y-0.5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition"></div>
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                        <Brain size={24} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Instructional Design Models</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Choose the best approach for your course</p>
                    </div>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {methodologies.map((method) => {
                    const Icon = method.icon;
                    const isSelected = formData.methodology === method.value;
                    const isExpanded = expandedMethodology === method.value;
                    
                    return (
                      <div
                        key={method.value}
                        className={`relative flex flex-col h-full rounded-2xl border-2 transition-all shadow-md bg-white dark:bg-slate-900 p-5 group overflow-hidden ${
                          isSelected
                            ? 'border-brand-teal ring-2 ring-brand-teal/30 scale-[1.03] shadow-lg'
                            : 'border-gray-200 dark:border-slate-700 hover:border-purple-400 hover:shadow-lg'
                        }`}
                        style={{ minHeight: 260 }}
                      >
                        {/* Comparison highlight effect on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
                        
                        <div className="relative flex items-start gap-3 mb-2">
                          <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-gradient-to-br from-brand-teal to-brand-cyan shadow-lg shadow-brand-teal/50' 
                              : 'bg-gray-100 dark:bg-slate-800 group-hover:bg-gray-200 dark:group-hover:bg-slate-700'
                          }`}> 
                            <Icon size={22} className={isSelected ? 'text-white' : 'text-brand-teal'} />
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-sm font-bold ${isSelected ? 'text-brand-teal' : 'text-gray-900 dark:text-white'}`}>{method.label}</h3>
                            {isSelected && <div className="text-xs text-brand-teal font-semibold mt-0.5">Selected</div>}
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={18} className="text-brand-teal flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 flex-1 leading-relaxed">{method.description}</p>
                        
                        {/* Custom Key Features with local state */}
                        {Array.isArray(method.tooltip) && method.tooltip.length > 0 && (
                          <div className="mb-3 border-t border-gray-200 dark:border-slate-700 pt-3">
                            <button
                              type="button"
                              onClick={() => setExpandedMethodology(isExpanded ? null : method.value)}
                              className="cursor-pointer text-xs text-brand-teal font-semibold select-none transition-all flex items-center gap-2 w-full mb-2 px-2 py-1.5 rounded-lg hover:bg-brand-teal/5 pointer-events-auto"
                            >
                              <span className={`text-xs transition-transform duration-200 inline-block flex-shrink-0 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                                ▶
                              </span>
                              <span className="flex-1 text-left">
                                Key Features
                              </span>
                            </button>
                            
                            {isExpanded && method.tooltip && method.tooltip.length > 0 && (
                              <ul className="mt-2 space-y-2 pl-4">
                                {method.tooltip.map((t: string, idx: number) => (
                                  <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex gap-2">
                                    <span className="text-brand-teal flex-shrink-0">•</span>
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, methodology: method.value })}
                          className={`mt-auto w-full text-xs text-brand-teal font-semibold text-center py-2 px-2 rounded-lg transition-all pointer-events-auto ${
                            isSelected
                              ? 'bg-brand-teal/10 border border-brand-teal/20 text-brand-teal'
                              : 'bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-brand-teal hover:bg-brand-teal hover:text-white hover:border-brand-teal'
                          }`}
                        >
                          {isSelected ? '✓ Selected Model' : 'Select This Model'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              </div>

              {/* AI Model Recommender Card - Removed live preview and quality score for a cleaner layout */}

              {/* Learning Outcomes Card - Premium Styling */}
              <div className="relative group">
                {/* Animated gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative bg-gradient-to-br from-white/95 to-cyan-50/95 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8 transition-all hover:shadow-2xl hover:-translate-y-0.5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition"></div>
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                        <Target size={24} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Learning Outcomes</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Define what learners will achieve</p>
                    </div>
                  </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                      <Target size={16} className="text-brand-teal" />
                      <span>Learning Outcomes</span>
                      <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-semibold">
                        Required
                      </span>
                      {formData.learningOutcomes.length >= 20 && (
                        <CheckCircle2 size={16} className="text-green-500" />
                      )}
                      <div className="relative ml-1">
                        <Info 
                          size={16} 
                          className="text-gray-400 hover:text-brand-teal cursor-help transition-colors"
                          onMouseEnter={() => setShowTooltip('learningOutcomes')}
                          onMouseLeave={() => setShowTooltip(null)}
                        />
                        {showTooltip === 'learningOutcomes' && (
                          <div className="absolute left-0 top-6 w-64 p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-xl z-50">
                            <strong>Be specific!</strong> Clear learning outcomes help AI create focused lessons and assessments that actually achieve your goals.
                          </div>
                        )}
                      </div>
                    </label>
                    <AIOutcomesPanel
                      courseTitle={formData.courseTitle}
                      targetAudience={formData.targetAudience}
                      knowledgeLevel={formData.knowledgeLevel}
                      duration={formData.duration}
                      methodology={formData.methodology}
                      approxModules={formData.approxModules}
                      approxLessonsPerModule={formData.approxLessonsPerModule}
                      existingOutcomes={formData.learningOutcomes}
                      userCredits={userCredits}
                      onEnhanced={(text) => {
                        setFormData(prev => ({ ...prev, learningOutcomes: text }))
                        setHasUnsavedChanges(true)
                      }}
                      onCreditsUpdate={(newBalance) => {
                        setUserCredits(newBalance)
                      }}
                    />
                  </div>
                  <textarea
                    value={formData.learningOutcomes}
                    onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
                    onFocus={() => setFocusedField('learningOutcomes')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="What will learners achieve? Use action verbs: create, analyze, implement..."
                    maxLength={1000}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      focusedField === 'learningOutcomes'
                        ? 'border-brand-teal ring-4 ring-brand-teal/10'
                        : 'border-gray-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none resize-none`}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.learningOutcomes.length >= 20 ? '✓ Excellent detail!' : 'Min 20 characters'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.learningOutcomes.length}/1000
                    </span>
                  </div>
                  
                  {/* Expandable Outcomes Tips Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <details className="group/outcomes">
                      <summary className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-brand-teal hover:text-purple-500 transition-colors select-none py-2">
                        <span className="text-lg group-open/outcomes:rotate-90 transition-transform">▶</span>
                        <Lightbulb size={16} />
                        <span>AI-Suggested Outcome Examples</span>
                      </summary>
                      <div className="mt-3 space-y-3 pl-6">
                        {formData.courseTitle && (
                          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">For &quot;{formData.courseTitle}&quot;:</p>
                            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                              <li className="flex gap-2">
                                <span>•</span>
                                <span>Learners will be able to understand core concepts and terminology</span>
                              </li>
                              <li className="flex gap-2">
                                <span>•</span>
                                <span>Learners will apply knowledge through hands-on exercises and scenarios</span>
                              </li>
                              <li className="flex gap-2">
                                <span>•</span>
                                <span>Learners will evaluate real-world situations and make informed decisions</span>
                              </li>
                            </ul>
                          </div>
                        )}
                        {formData.knowledgeLevel && formData.knowledgeLevel !== 'let-ai-decide' && (
                          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                            <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1">For {formData.knowledgeLevel} learners:</p>
                            <ul className="space-y-1 text-xs text-purple-800 dark:text-purple-200">
                              {formData.knowledgeLevel === 'Beginner' && (
                                <>
                                  <li className="flex gap-2"><span>•</span><span>Build foundational understanding of essential concepts</span></li>
                                  <li className="flex gap-2"><span>•</span><span>Develop confidence through guided practice</span></li>
                                </>
                              )}
                              {formData.knowledgeLevel === 'Intermediate' && (
                                <>
                                  <li className="flex gap-2"><span>•</span><span>Deepen existing knowledge and fill knowledge gaps</span></li>
                                  <li className="flex gap-2"><span>•</span><span>Master advanced techniques and best practices</span></li>
                                </>
                              )}
                              {formData.knowledgeLevel === 'Advanced' && (
                                <>
                                  <li className="flex gap-2"><span>•</span><span>Master advanced techniques and cutting-edge practices</span></li>
                                  <li className="flex gap-2"><span>•</span><span>Solve complex problems and lead in the field</span></li>
                                </>
                              )}
                              {formData.knowledgeLevel === 'Mixed Level' && (
                                <>
                                  <li className="flex gap-2"><span>•</span><span>Accommodate diverse learner backgrounds and paces</span></li>
                                  <li className="flex gap-2"><span>•</span><span>Provide both foundational and advanced content tracks</span></li>
                                </>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                  {/* Error display moved into AIOutcomesPanel */}
                </div>
              </div>
              </div>

              {/* Additional Details Card - Premium Styling */}
              <div className="relative group">
                {/* Animated gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-brand-teal/20 to-brand-cyan/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                
                <div className="relative bg-gradient-to-br from-white/95 to-emerald-50/95 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8 transition-all hover:shadow-2xl hover:-translate-y-0.5">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-brand-teal rounded-xl blur opacity-50 group-hover:opacity-75 transition"></div>
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-brand-teal flex items-center justify-center shadow-lg">
                        <Globe size={24} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Additional Details</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Optional but helpful</p>
                    </div>
                  </div>

                <div className="space-y-6">
                  {/* Target Location */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900 dark:text-white uppercase tracking-wide">
                      <Globe size={16} className="text-brand-teal" />
                      <span>Target Location</span>
                      <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-semibold">
                        Optional
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.targetLocation}
                      onChange={(e) => setFormData({ ...formData, targetLocation: e.target.value })}
                      placeholder="e.g., Global, North America, Asia-Pacific"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Upload Documents */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3 text-gray-900 dark:text-white uppercase tracking-wide">
                      <Upload size={16} className="text-brand-teal" />
                      <span>Supporting Documents</span>
                      <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-semibold">
                        Optional
                      </span>
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-48 px-4 transition-all border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-brand-teal/5 hover:border-brand-teal hover:shadow-lg group relative overflow-hidden">
                      {/* Animated background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/5 to-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex flex-col items-center justify-center pt-5 pb-6 w-full">
                        <div className="w-16 h-16 mb-3 rounded-full bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-brand-teal/30 transition-all">
                          <Upload size={24} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white mb-1 text-center">
                          Drop your files here
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 text-center mb-2">
                          or click to browse
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                          PDF, PPT, Word • Up to 50MB
                        </span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.ppt,.pptx,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Cloud Sync Indicator */}
                    {formData.uploadedFiles.length > 0 && (
                      <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Cloud synced</span>
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">{formData.uploadedFiles.length} file{formData.uploadedFiles.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {/* Uploaded Files List */}
                    {formData.uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.uploadedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all group/file"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                                <FileText size={18} className="text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{file.size ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : 'Uploaded'}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(idx)}
                              className="p-2 opacity-0 group-hover/file:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all ml-2"
                            >
                              <X size={16} className="text-red-500" />
                            </button>
                          </div>
                        ))}

                        {/* File Notes */}
                        <div className="mt-4">
                          <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
                            <FileText size={16} className="text-brand-teal" />
                            <span>Document Description</span>
                            <span className="inline-flex items-center gap-1 ml-auto px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-semibold">
                              Required
                            </span>
                            <div className="relative ml-1">
                              <Info 
                                size={16} 
                                className="text-gray-400 hover:text-brand-teal cursor-help transition-colors"
                                onMouseEnter={() => setShowTooltip('fileNotes')}
                                onMouseLeave={() => setShowTooltip(null)}
                              />
                              {showTooltip === 'fileNotes' && (
                                <div className="absolute left-0 top-6 w-72 p-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-xl z-50">
                                  <strong>Guide the AI:</strong> Explain how to use these documents:
                                  <ul className="mt-2 ml-4 list-disc space-y-1">
                                    <li>Use as reference material only</li>
                                    <li>Follow the same structure/pattern</li>
                                    <li>Update/modernize existing content</li>
                                    <li>Extract key concepts and expand</li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </label>
                          <textarea
                            value={formData.fileNotes}
                            onChange={(e) => setFormData({ ...formData, fileNotes: e.target.value })}
                            placeholder="Required: How should AI interpret these documents? (e.g., 'Use as reference for terminology' or 'Follow this structure for lessons')"
                            required
                            maxLength={500}
                            rows={3}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                              formData.fileNotes.length > 0 
                                ? 'border-green-500 dark:border-green-600' 
                                : 'border-red-300 dark:border-red-700'
                            } bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 focus:outline-none resize-none`}
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formData.fileNotes.length > 0 ? '✓ Great!' : '⚠️ Required when files are uploaded'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formData.fileNotes.length}/500
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      <FileText size={16} className="text-brand-teal" />
                      Reference Links or Notes <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <textarea
                      value={formData.additionalInfo}
                      onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                      placeholder="Add any reference links, websites, or additional information..."
                      maxLength={500}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/10 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Navigation at bottom */}
          <div className="mt-6">
            <StepNavigation 
              currentStep={1} 
              onNext={handleNext}
              isValid={Boolean(isValid && !isLoading)}
            />
          </div>
        </div>
      </main>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSave={() => {
          if (pendingNavigation) {
            handleSaveAndNavigate(pendingNavigation)
          }
          setShowUnsavedModal(false)
        }}
        onDiscard={() => {
          if (pendingNavigation) {
            handleDiscardAndNavigate(pendingNavigation)
          }
          setShowUnsavedModal(false)
        }}
        onCancel={() => {
          setShowUnsavedModal(false)
          setPendingNavigation(null)
        }}
      />
    </div>
  )
}
