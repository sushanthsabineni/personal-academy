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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
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
        <div className="w-full px-6 py-2 border-b border-light-border dark:border-dark-border">
          <div className="max-w-full mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-light-text dark:text-dark-text mb-1">
                Essential Course Details
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                Share your vision and watch AI transform it into an engaging learning experience
              </p>
              {/* Auto-save indicator */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {hasUnsavedChanges ? 'Saving...' : 'All changes saved'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8">
          {/* Responsive Single Column Layout after removing right column */}
          <div className="flex justify-center">
            <div className="w-full max-w-3xl space-y-6">
              {/* Essential Information Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center">
                    <Rocket size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Essential Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">The foundation of your course</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Course Title */}
                  <div className="relative">
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      <BookOpen size={16} className="text-brand-teal" />
                      Course Title <span className="text-red-500">*</span>
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
                  </div>

                  {/* Industry & Target Audience (2 columns) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        <TrendingUp size={16} className="text-brand-teal" />
                        Industry <span className="text-red-500">*</span>
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
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        <Users size={16} className="text-brand-teal" />
                        Target Audience <span className="text-red-500">*</span>
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

                  {/* Knowledge Level - Premium Pills */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                      <Award size={16} className="text-brand-teal" />
                      Knowledge Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Beginner', 'Intermediate', 'Advanced', 'Mixed Level'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setFormData({ ...formData, knowledgeLevel: level })}
                          className={`relative h-14 rounded-xl font-medium text-sm transition-all overflow-hidden group ${
                            formData.knowledgeLevel === level
                              ? 'bg-gradient-to-br from-brand-teal to-brand-cyan text-white shadow-lg shadow-brand-teal/30 scale-105'
                              : 'bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-brand-teal hover:scale-105'
                          }`}
                        >
                          {formData.knowledgeLevel === level && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          )}
                          <span className="relative z-10">{level}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                      <Clock size={16} className="text-brand-teal" />
                      Expected Duration <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
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
                  </div>

                  {/* Approx Number of Modules (Dropdown, mandatory, AI integration) */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                      <BookOpen size={16} className="text-brand-teal" />
                      Approx Number of Modules <span className="text-red-500">*</span>
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
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                      <Lightbulb size={16} className="text-brand-teal" />
                      Approx Number of Lessons per Module <span className="text-red-500">*</span>
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

              {/* Learning Methodology Card - Redesigned as Card Grid */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center">
                    <Brain size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Instructional Design Models</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose your instructional approach</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {methodologies.map((method) => {
                    const Icon = method.icon;
                    const isSelected = formData.methodology === method.value;
                    const [showDetails, setShowDetails] = [false, false]; // Placeholder for expand/collapse if needed
                    return (
                      <div
                        key={method.value}
                        className={`relative flex flex-col h-full rounded-2xl border-2 transition-all shadow-md bg-white dark:bg-slate-900 p-5 group ${
                          isSelected
                            ? 'border-brand-teal ring-2 ring-brand-teal/30 scale-[1.03] shadow-lg'
                            : 'border-gray-200 dark:border-slate-700 hover:border-brand-teal hover:shadow-lg'
                        }`}
                        style={{ minHeight: 260 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? 'bg-brand-teal' : 'bg-gray-100 dark:bg-slate-800'}`}> 
                            <Icon size={22} className={isSelected ? 'text-white' : 'text-brand-teal'} />
                          </div>
                          <h3 className={`text-base font-bold ${isSelected ? 'text-brand-teal' : 'text-gray-900 dark:text-white'}`}>{method.label}</h3>
                          {isSelected && (
                            <CheckCircle2 size={20} className="text-brand-teal ml-auto" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 flex-1">{method.description}</p>
                        {Array.isArray(method.tooltip) && (
                          <details className="mb-3">
                            <summary className="cursor-pointer text-xs text-brand-teal font-semibold select-none">Key Features</summary>
                            <ul className="mt-2 list-disc ml-5 text-xs text-gray-500 dark:text-gray-400">
                              {method.tooltip.map((t: string, idx: number) => (
                                <li key={idx}>{t}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, methodology: method.value })}
                          className={`mt-auto w-full py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                            isSelected
                              ? 'bg-brand-teal text-white shadow-md'
                              : 'bg-gray-100 dark:bg-slate-800 text-brand-teal hover:bg-brand-teal hover:text-white border border-brand-teal/30'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Model Recommender Card - Removed live preview and quality score for a cleaner layout */}

              {/* Learning Outcomes Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center">
                    <Target size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Learning Outcomes</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Define what learners will achieve</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <Target size={16} className="text-brand-teal" />
                      Learning Outcomes <span className="text-red-500">*</span>
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
                      onEnhanced={(text) => {
                        setFormData(prev => ({ ...prev, learningOutcomes: text }))
                        setHasUnsavedChanges(true)
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
                  {/* Error display moved into AIOutcomesPanel */}
                </div>
              </div>

              {/* Optional Details Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center">
                    <Globe size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Additional Details</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Optional but helpful</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Target Location */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      <Globe size={16} className="text-brand-teal" />
                      Target Location <span className="text-gray-400 text-xs">(Optional)</span>
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
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      <Upload size={16} className="text-brand-teal" />
                      Supporting Documents <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-40 px-4 transition-all border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-brand-teal/5 hover:border-brand-teal group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-16 h-16 mb-3 rounded-full bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload size={24} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Drop files here or click to upload
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, PPT, Word • Max 50MB
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

                    {/* Uploaded Files List */}
                    {formData.uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.uploadedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
                          >
                            <span className="text-sm text-gray-900 dark:text-white truncate flex items-center gap-2">
                              <FileText size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                              {file.name}
                            </span>
                            <button
                              onClick={() => removeFile(idx)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                            >
                              <X size={16} className="text-red-500" />
                            </button>
                          </div>
                        ))}

                        {/* File Notes */}
                        <div className="mt-4">
                          <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                            <FileText size={16} className="text-brand-teal" />
                            Document Description <span className="text-red-500">*</span>
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
          
          {/* AI Credits Warning */}
          <div className="mt-6 mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Zap size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  AI Credits Usage
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Using AI-enhanced features like &quot;AI Enhance&quot; buttons and automated content generation will consume more credits. The more AI features you use, the higher your credit consumption will be.
                </p>
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
