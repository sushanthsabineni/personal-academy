'use client'

// React
import { useState, useEffect } from 'react'

// Next.js
import { useRouter } from 'next/navigation'

// External libraries
import { 
  Wand2, Upload, X, Edit3, FileText, Sparkles, Users, Target, 
  Clock, BookOpen, Lightbulb, Globe, TrendingUp, Award, Zap,
  CheckCircle2, Brain, Rocket, Info
} from '@/lib/icons'

// Internal components
import { CreateCourseSidebar } from '@/components/layout/CreateCourseSidebar'
import { StepNavigation } from '@/components/layout/StepNavigation'
import { UnsavedChangesModal } from '@/components/course/UnsavedChangesModal'

// Internal utilities
import { 
  getCurrentDraft, 
  createNewCourse, 
  updateCourseProgress
} from '@/lib/courseStorage'

export default function CourseStep1() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    courseTitle: '',
    industry: '',
    targetAudience: '',
    knowledgeLevel: 'Intermediate',
    learningOutcomes: '',
    duration: 30,
    durationUnit: 'minutes',
    targetLocation: '',
    methodology: 'let-ai-decide',
    additionalInfo: '',
    uploadedFiles: [] as { name: string; type: string }[],
    fileNotes: '',
  })

  // Load existing course or create new one
  useEffect(() => {
    const currentDraft = getCurrentDraft()
    // Use setTimeout to avoid cascading renders
    setTimeout(() => {
      if (currentDraft) {
        setCourseId(currentDraft.id)
        if (currentDraft.courseTitle) {
          setFormData(prev => ({
            ...prev,
            courseTitle: currentDraft.courseTitle || '',
            targetAudience: currentDraft.targetAudience || '',
            learningOutcomes: currentDraft.learningObjectives || '',
          }))
        }
      } else {
        // Create new course
        const newCourse = createNewCourse()
        setCourseId(newCourse.id)
      }
      setIsInitialized(true)
    }, 0)
  }, [])

  // Track changes - only after initialization
  useEffect(() => {
    if (!isInitialized || !courseId) return
    if (!formData.courseTitle && !formData.targetAudience && !formData.learningOutcomes) return

    // Auto-save after 2 seconds of inactivity
    const saveTimeout = setTimeout(() => {
      updateCourseProgress(courseId, 1, {
        courseTitle: formData.courseTitle,
        targetAudience: formData.targetAudience,
        learningObjectives: formData.learningOutcomes,
        description: formData.additionalInfo || formData.learningOutcomes.substring(0, 100)
      })
      setHasUnsavedChanges(false)
    }, 2000)
    
    // Mark as having unsaved changes (after setting up the timeout)
    const changeTimeout = setTimeout(() => setHasUnsavedChanges(true), 0)
    
    return () => {
      clearTimeout(saveTimeout)
      clearTimeout(changeTimeout)
    }
  }, [formData, courseId, isInitialized])

  // E-learning methodologies with rich data
  const methodologies = [
    { 
      value: 'blooms-taxonomy', 
      label: "Bloom's Taxonomy",
      icon: Brain,
      description: 'Progressive cognitive skill development',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      value: 'addie', 
      label: 'ADDIE Model',
      icon: Target,
      description: 'Systematic instructional design',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      value: 'constructivism', 
      label: 'Constructivism',
      icon: Lightbulb,
      description: 'Learn through experience',
      color: 'from-amber-500 to-orange-500'
    },
    { 
      value: 'experiential', 
      label: 'Experiential',
      icon: Rocket,
      description: 'Hands-on practice approach',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      value: 'microlearning', 
      label: 'Microlearning',
      icon: Zap,
      description: 'Bite-sized modules',
      color: 'from-red-500 to-rose-500'
    },
    { 
      value: 'let-ai-decide', 
      label: 'AI-Optimized',
      icon: Sparkles,
      description: 'Let AI decide for you',
      color: 'from-brand-teal to-brand-cyan'
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
    (formData.uploadedFiles.length === 0 || formData.fileNotes.trim().length > 0) // File notes required if files uploaded

  // Auto-fill sample data
  const handleAutoFill = () => {
    setFormData({
      courseTitle: 'Advanced Digital Marketing Mastery',
      industry: 'Technology & Digital Services',
      targetAudience: 'Marketing Managers, Digital Strategists',
      knowledgeLevel: 'Intermediate',
      learningOutcomes:
        'Learners will be able to: Create data-driven marketing strategies, Master social media analytics and optimization, Design effective email marketing campaigns, Implement SEO best practices, Analyze competitor strategies and market trends, Build customer engagement funnels.',
      duration: 45,
      durationUnit: 'minutes',
      targetLocation: 'Global',
      methodology: 'let-ai-decide',
      additionalInfo: 'https://example.com/resources',
      uploadedFiles: [],
      fileNotes: '',
    })
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        name: file.name,
        type: file.type,
      }))
      setFormData((prev) => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles],
      }))
    }
  }

  // Remove uploaded file
  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }))
  }

  // Handle next step
  const handleNext = () => {
    if (!isValid || !courseId) return
    
    // Save progress
    updateCourseProgress(courseId, 1, {
      courseTitle: formData.courseTitle,
      targetAudience: formData.targetAudience,
      learningObjectives: formData.learningOutcomes,
      numberOfModules: 0, // Will be set in step 2
      description: formData.additionalInfo || formData.learningOutcomes.substring(0, 100)
    })
    
    setHasUnsavedChanges(false)
    setIsLoading(true)
    setTimeout(() => {
      // Navigate to multimedia step
      router.push('/create/multimedia')
    }, 800)
  }

  // Handle save and continue
  const handleSaveAndNavigate = (path: string) => {
    if (courseId) {
      updateCourseProgress(courseId, 1, {
        courseTitle: formData.courseTitle,
        targetAudience: formData.targetAudience,
        learningObjectives: formData.learningOutcomes,
        description: formData.additionalInfo || formData.learningOutcomes.substring(0, 100)
      })
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
      <main className="flex-1 pl-20 lg:pl-20 pt-6 pb-12 transition-all duration-300 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent">
              Essential Course Details
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Share your vision and watch AI transform it into an engaging learning experience
            </p>
            {/* Auto-save indicator */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasUnsavedChanges ? 'Saving...' : 'All changes saved'}
              </p>
            </div>
          </div>

          {/* Top Right Sample Data Button */}
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={handleAutoFill}
              className="px-3 py-1.5 text-xs bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-brand-teal border border-brand-teal/30 rounded-lg hover:bg-brand-teal/10 transition-all flex items-center gap-1.5"
            >
              <Edit3 size={14} />
              Try with sample data
            </button>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Main Form (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              
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

                  {/* Learning Outcomes */}
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
                      <button
                        type="button"
                        className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:border-brand-teal hover:text-brand-teal transition-all flex items-center gap-1"
                      >
                        <Wand2 size={14} />
                        AI Enhance
                      </button>
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
                      
                      {/* Unit Selector Pills */}
                      <div className="col-span-2 grid grid-cols-3 gap-2">
                        {['minutes', 'hours', 'days'].map((unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => setFormData({ ...formData, durationUnit: unit })}
                            className={`h-14 rounded-xl font-medium text-sm capitalize transition-all ${
                              formData.durationUnit === unit
                                ? 'bg-gradient-to-br from-brand-teal to-brand-cyan text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-brand-teal'
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Methodology Card */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all hover:shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center">
                    <Brain size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Learning Methodology</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose your instructional approach</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {methodologies.map((method) => {
                    const Icon = method.icon
                    const isSelected = formData.methodology === method.value
                    return (
                      <button
                        key={method.value}
                        onClick={() => setFormData({ ...formData, methodology: method.value })}
                        className={`relative p-4 rounded-xl transition-all overflow-hidden group ${
                          isSelected
                            ? `bg-gradient-to-br ${method.color} text-white shadow-lg scale-105`
                            : 'bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 hover:border-brand-teal hover:scale-105'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        )}
                        <div className="relative z-10">
                          <Icon size={24} className={`mb-2 ${isSelected ? 'text-white' : 'text-brand-teal'}`} />
                          <h3 className={`text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {method.label}
                          </h3>
                          <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                            {method.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 size={18} className="text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
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
            
            {/* Right Column - Live Preview (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                {/* Live Preview Card */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles size={20} className="text-brand-teal" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Preview</h3>
                  </div>
                  
                  {/* Course Title Preview */}
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Course Title
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formData.courseTitle || 'Your course title will appear here...'}
                    </div>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Industry */}
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Target size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Industry</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {formData.industry || 'Not set'}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock size={14} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Duration</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {formData.duration ? `${formData.duration} ${formData.durationUnit}` : 'Not set'}
                      </div>
                    </div>

                    {/* Level */}
                    <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Level</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {formData.knowledgeLevel || 'Not set'}
                      </div>
                    </div>

                    {/* Audience */}
                    <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Users size={14} className="text-orange-600 dark:text-orange-400" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Audience</span>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {formData.targetAudience || 'Not set'}
                      </div>
                    </div>
                  </div>

                  {/* Methodology Preview */}
                  {formData.methodology && (
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Methodology
                      </div>
                      <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-slate-600">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const method = methodologies.find(m => m.label === formData.methodology);
                            const IconComponent = method?.icon;
                            return IconComponent && <IconComponent size={16} className="text-gray-700 dark:text-gray-300" />;
                          })()}
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formData.methodology}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Learning Outcomes */}
                  {formData.learningOutcomes && (
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Key Outcomes
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {formData.learningOutcomes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quality Score Card */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={20} className="text-brand-teal" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quality Score</h3>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Form Completion
                      </span>
                      <span className="text-sm font-bold text-brand-teal">
                        {getCompletionPercentage()}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-teal to-brand-cyan transition-all duration-500 ease-out"
                        style={{ width: `${getCompletionPercentage()}%` }}
                      />
                    </div>
                  </div>

                  {/* Contextual Tips */}
                  <div className="mt-4 p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <Lightbulb size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-gray-700 dark:text-gray-300">
                        {getCompletionPercentage() < 30 && (
                          <span><strong>Tip:</strong> Start with a clear, descriptive course title to attract learners.</span>
                        )}
                        {getCompletionPercentage() >= 30 && getCompletionPercentage() < 60 && (
                          <span><strong>Tip:</strong> Define specific learning outcomes to help students understand what they&apos;ll achieve.</span>
                        )}
                        {getCompletionPercentage() >= 60 && getCompletionPercentage() < 90 && (
                          <span><strong>Tip:</strong> Add optional details like reference materials to enrich the course experience.</span>
                        )}
                        {getCompletionPercentage() >= 90 && (
                          <span><strong>Great job!</strong> Your course foundation looks solid. Ready to move to the next step!</span>
                        )}
                      </div>
                    </div>
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
              isValid={isValid && !isLoading}
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
