
"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, X, AlertCircle, CheckCircle,
  Download, File, Presentation, FileText, Edit2, Check, Menu
} from '@/lib/icons'
import { CreateCourseSidebar } from '@/components/layout/CreateCourseSidebar'
import type { Database } from '@/lib/supabase/database.types'
import { supabase, checkAuth } from '@/lib/supabase/client'
import { generateSlidesForAllLessons, formatSlidesForDatabase } from '@/lib/utils/slideGenerator'
import { exportToPDF, exportToPPT, exportToWord } from '@/lib/exportUtils'

type Slide = Database["public"]["Tables"]["slides"]["Row"]

export default function CourseStep4() {
  const router = useRouter()
  const [courseId, setCourseId] = useState<string | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [generatingSlides, setGeneratingSlides] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const slidesGeneratedRef = useRef(false)

  // Sidebar states
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [approvedModules, setApprovedModules] = useState<Set<string>>(new Set())
  const [showExportModal, setShowExportModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Fetch course data and slides
  useEffect(() => {
    async function loadCourseData() {
      const user = await checkAuth()
      console.log('[Storyboard] Auth check - User:', user?.id)
      
      if (!user) {
        console.log('[Storyboard] No user found, redirecting to dashboard')
        router.push('/dashboard')
        return
      }

      setLoading(true)
      try {
        // First try to get draft/in_progress courses
        console.log('[Storyboard] Fetching draft/in_progress courses for user:', user.id)
        const courseQuery = await supabase
          .from('courses')
          .select('id, title, status, description, knowledge_level, target_audience')
          .eq('user_id', user.id)
          .in('status', ['draft', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(1)

        let courses = courseQuery.data
        const courseError = courseQuery.error

        if (courseError) {
          console.error('[Storyboard] Course error:', courseError)
          throw courseError
        }

        console.log('[Storyboard] Draft courses found:', courses?.length || 0)

        // Fallback: if no draft/in_progress, get ANY recent course
        if (!courses || courses.length === 0) {
          console.log('[Storyboard] No draft courses, trying to fetch any recent course')
          const { data: anyCourse } = await supabase
            .from('courses')
            .select('id, title, status, description, knowledge_level, target_audience')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
          courses = anyCourse
          console.log('[Storyboard] Any course found:', anyCourse?.length || 0)
        }

        const typedCourses = courses as { id: string; title: string; status: string; description?: string; knowledge_level?: string; target_audience?: string }[] | null
        const course = typedCourses && typedCourses.length > 0 ? typedCourses[0] : null

        console.log('[Storyboard] Selected course:', course?.id, course?.title, course?.status)

        if (!course) {
          console.log('[Storyboard] No course found - user needs to create one first')
          setError('No course found. Please create a course first by completing Step 1: Essentials.')
          setLoading(false)
          return
        }

        setCourseId(course.id)

        // Load existing slides
        console.log('[Storyboard] Fetching slides for course:', course.id)
        const { data: slidesData, error: slidesError } = await supabase
          .from('slides')
          .select('*')
          .eq('course_id', course.id)
          .order('slide_number', { ascending: true })

        if (slidesError) {
          console.error('[Storyboard] Slides error:', slidesError)
          throw slidesError
        }

        console.log('[Storyboard] Slides found:', slidesData?.length || 0)

        if (slidesData && slidesData.length > 0) {
          console.log('[Storyboard] Setting slides from database:', slidesData.length, 'slides')
          setSlides(slidesData as Slide[])
          // Set all modules as auto-approved since slides exist
          const modules = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', course.id)
          if (modules.data) {
            setApprovedModules(new Set(modules.data.map(m => (m as { id: string }).id)))
          }
        } else {
          // No slides exist yet - show approval dialog
          console.log('[Storyboard] No slides found - showing approval dialog')
          setShowApprovalDialog(true)
        }
      } catch (err) {
        console.error('[Storyboard] Error loading course:', err)
        setError('Failed to load course data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (!slidesGeneratedRef.current) {
      console.log('[Storyboard] Component mounted, loading course data')
      loadCourseData()
      slidesGeneratedRef.current = true
    }
  }, [router])

  // Auto-generate slides
  async function handleGenerateSlides() {
    if (!courseId) {
      console.error('[Storyboard] No courseId set')
      setError('No course selected')
      return
    }

    console.log('[Storyboard] Starting slide generation for course:', courseId)
    setGeneratingSlides(true)
    setError(null)
    setSuccess(null)

    try {
      // Fetch course details with all context from step 1
      console.log('[Storyboard] Fetching course details...')
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('title, description, knowledge_level, target_audience')
        .eq('id', courseId)
        .single()

      if (courseError) throw courseError

      console.log('[Storyboard] Course data fetched:', (courseData as {title?: string})?.title)

      const course = courseData as {
        title: string
        description?: string
        knowledge_level?: string
        target_audience?: string
      }

      console.log('[Storyboard] Getting API key...')
      const apiResponse = await fetch('/api/get-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service: 'openrouter' })
      })

      if (!apiResponse.ok) {
        const error = await apiResponse.json()
        throw new Error(error.message || 'Failed to get API key')
      }

      const { apiKey } = await apiResponse.json()
      if (!apiKey) throw new Error('API key not configured in environment')

      console.log('[Storyboard] API key retrieved, fetching modules...')

      // Fetch all modules with descriptions (from step 2)
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('id, title, description, order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

      if (modulesError) throw modulesError

      console.log('[Storyboard] Modules found:', modulesData?.length || 0)

      if (!modulesData || modulesData.length === 0) {
        const msg = 'No modules found. Please add modules (Step 2) before generating slides.'
        console.log('[Storyboard]', msg)
        setError(msg)
        setShowApprovalDialog(false)
        return
      }

      let totalSlidesGenerated = 0
      let nextSlideNumber = 1

      for (const moduleItem of modulesData) {
        const mod = moduleItem as {id: string; title: string; description: string; order_index: number}
        
        console.log('[Storyboard] Processing module:', mod.title)

        // Fetch lessons with descriptions (from step 3)
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title, description')
          .eq('module_id', mod.id as string)
          .order('order_index', { ascending: true })

        if (lessonsError) {
          console.error('[Storyboard] Error fetching lessons for module', mod.id, lessonsError)
          continue
        }

        console.log('[Storyboard] Lessons found for module', mod.title + ':', lessons?.length || 0)

        if (!lessons || lessons.length === 0) {
          console.log('[Storyboard] No lessons in module', mod.title, '- skipping')
          continue
        }

        try {
          const lessonData = lessons.map(l => {
            const lesson = l as {id: string; title: string; description: string}
            return {
              id: lesson.id as string,
              title: (lesson.title || 'Untitled Lesson') as string,
              description: (lesson.description || '') as string
            }
          })

          console.log('[Storyboard] Generating slides for', lessonData.length, 'lessons in module:', mod.title)

          // Generate slides with FULL CONTEXT from all previous pages
          const generatedSlides = await generateSlidesForAllLessons(
            lessonData,
            mod.title,
            mod.description,
            course.title,
            course.description,
            course.knowledge_level || 'intermediate',
            course.target_audience || 'Adult learners',
            apiKey
          )

          console.log('[Storyboard] Generated slides for module:', generatedSlides.length, 'lesson batches')

          for (const lessonSlides of generatedSlides) {
            console.log('[Storyboard] Processing', lessonSlides.slides.length, 'slides for lesson:', lessonSlides.lessonTitle)

            const formattedSlides = formatSlidesForDatabase(
              lessonSlides.slides,
              courseId,
              mod.id as string,
              lessonSlides.lessonId,
              nextSlideNumber
            )

            if (formattedSlides.length > 0) {
              console.log('[Storyboard] Inserting', formattedSlides.length, 'slides to database')
              console.log('[Storyboard] First slide sample:', JSON.stringify(formattedSlides[0], null, 2))
              const { error: insertError } = await supabase
                .from('slides')
                .insert(formattedSlides as never[])

              if (!insertError) {
                totalSlidesGenerated += formattedSlides.length
                nextSlideNumber += formattedSlides.length
                console.log('[Storyboard] Successfully inserted slides. Total so far:', totalSlidesGenerated)
              } else {
                console.error('[Storyboard] Error inserting slides:', insertError)
                console.error('[Storyboard] Insert error details:', JSON.stringify(insertError, null, 2))
                console.error('[Storyboard] Formatted slides sample:', JSON.stringify(formattedSlides.slice(0, 2), null, 2))
              }
            }
          }
        } catch (err) {
          console.error(`Error generating slides for module ${mod.id}:`, err)
        }

        await new Promise(resolve => setTimeout(resolve, 500))
      }

      console.log('[Storyboard] Total slides generated:', totalSlidesGenerated)

      // Reload slides
      console.log('[Storyboard] Reloading slides from database...')
      const { data: updatedSlides, error: reloadError } = await supabase
        .from('slides')
        .select('*')
        .eq('course_id', courseId)
        .order('slide_number', { ascending: true })

      if (!reloadError && updatedSlides) {
        console.log('[Storyboard] Slides reloaded:', updatedSlides.length)
        setSlides(updatedSlides as Slide[])
        setSuccess(`Successfully created ${totalSlidesGenerated} slides!`)
        setShowApprovalDialog(false)
      } else {
        throw reloadError || new Error('Failed to reload slides')
      }
    } catch (err) {
      console.error('[Storyboard] Error generating slides:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate slides'
      setError(errorMsg)
    } finally {
      setGeneratingSlides(false)
    }
  }

  const handleSlideClick = (slide: Slide) => {
    setSelectedSlide(slide)
    setEditingSlide(null)
  }

  const approveAllModules = async () => {
    if (!courseId) return
    const { data: modules } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
    if (modules) {
      setApprovedModules(new Set(modules.map((m: { id: string }) => m.id)))
    }
  }

  const getModulesWithSlides = async () => {
    if (!courseId) return []
    const { data: modules } = await supabase
      .from('modules')
      .select('id, title, description, order_index, lessons(id, title, description, order_index)')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })
    return (modules || []) as Array<{id: string; title: string; description: string; order_index: number; lessons: Array<{id: string; title: string; description: string; order_index: number}>}>
  }

  const handleExport = async (format: string) => {
    if (!courseId || slides.length === 0) return

    try {
      setLoading(true)
      const modules = await getModulesWithSlides()
      
      // Convert to expected format
      const modulesForExport = modules.map(m => ({
        ...m,
        lessons: (m.lessons || []).map((l: {id: string; title: string; order_index: number}) => ({
          ...l,
          slides: slides.filter(s => s.lesson_id === l.id)
        }))
      }))

      if (format === 'pdf') {
        await exportToPDF(modulesForExport as never, 'Course Storyboard')
      } else if (format === 'ppt') {
        await exportToPPT(modulesForExport as never, 'Course Storyboard')
      } else if (format === 'word') {
        await exportToWord(modulesForExport as never, 'Course Storyboard')
      }
      setShowExportModal(false)
      setSuccess(`Course exported as ${format.toUpperCase()} successfully!`)
    } catch (_err) {
      console.error('Error exporting:', _err)
      setError('Failed to export course')
    } finally {
      setLoading(false)
    }
  }

  const updateSlideContent = (field: string, value: string) => {
    if (editingSlide && selectedSlide) {
      const updated = { ...editingSlide, [field]: value }
      setEditingSlide(updated)
      setSelectedSlide(updated)
    }
  }

  const saveSlide = async () => {
    if (!editingSlide) return
    try {
      const { error } = await supabase
        .from('slides')
        .update({
          title: editingSlide.title,
          content: editingSlide.content,
          media_notes: editingSlide.media_notes,
          learning_objective: editingSlide.learning_objective,
          interaction_type: editingSlide.interaction_type
        } as never)
        .eq('id', editingSlide.id)

      if (error) throw error
      
      setSlides(slides.map(s => s.id === editingSlide.id ? editingSlide : s))
      setSelectedSlide(editingSlide)
      setEditingSlide(null)
      setSuccess('Slide saved successfully!')
    } catch (_err) {
      console.error('Error saving slide:', _err)
      setError('Failed to save slide')
    }
  }

  const deleteSlide = async (slideId: string) => {
    if (!confirm('Delete this slide?')) return
    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideId)
      if (error) throw error
      setSlides(slides.filter(s => s.id !== slideId))
      if (selectedSlide?.id === slideId) setSelectedSlide(null)
      setSuccess('Slide deleted')
    } catch (err) {
      console.error('Error deleting slide:', err)
      setError('Failed to delete slide')
    }
  }

  const getNextSlide = () => {
    if (!selectedSlide) return null
    const index = slides.findIndex(s => s.id === selectedSlide.id)
    return index < slides.length - 1 ? slides[index + 1] : null
  }

  const getPrevSlide = () => {
    if (!selectedSlide) return null
    const index = slides.findIndex(s => s.id === selectedSlide.id)
    return index > 0 ? slides[index - 1] : null
  }

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
      <CreateCourseSidebar />
      <main className="flex-1 transition-[padding-left] duration-300 flex flex-col h-full overflow-hidden" style={{ paddingLeft: 'var(--create-sidebar-width, 5rem)' }}>
        {/* Header */}
        <div className="w-full px-6 py-4 border-b border-light-border dark:border-dark-border flex-shrink-0 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-light-text dark:text-dark-text">Step 4: Storyboard & Slides</h1>
              <p className="text-sm text-gray-500 mt-1">Review and export your course slides</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex px-3 py-1.5 text-xs font-semibold text-brand-teal border border-brand-teal/30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg hover:bg-brand-teal/10 transition-all items-center gap-1.5"
              >
                <BookOpen size={14} />
                Dashboard
              </button>
            </div>
          </div>

          {/* Debug Info - Only show when no slides */}
          {slides.length === 0 && !showApprovalDialog && (
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 p-2 rounded mt-2">
              <p>📌 Debug Info: Course ID: {courseId ? courseId.slice(0, 8) + '...' : 'Not loaded'} | Slides: {slides.length} | Dialog: {showApprovalDialog ? 'visible' : 'hidden'}</p>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="px-6 pt-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="px-6 pt-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex gap-3">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700 dark:text-green-300">{success}</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center w-full">
              <div className="text-center">
                <div className="mb-4 inline-block animate-spin">
                  <div className="h-8 w-8 border-4 border-brand-teal border-t-transparent rounded-full"></div>
                </div>
                <p className="text-gray-500">Loading course data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Sidebar - Hidden on mobile, visible on lg */}
              <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-80 border-r border-light-border dark:border-dark-border bg-white dark:bg-slate-800 flex flex-col absolute lg:relative lg:h-full z-40 lg:z-0`}>
                {/* Header with buttons */}
                <div className="p-4 border-b border-light-border dark:border-dark-border bg-gray-50 dark:bg-slate-900 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Course Modules</h3>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="lg:hidden p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                    >
                      <X size={20} className="text-gray-900 dark:text-white" />
                    </button>
                  </div>

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
                      disabled={approvedModules.size === 0 || slides.length === 0}
                      className="px-3 py-2 text-xs bg-brand-teal hover:bg-brand-teal/90 text-white font-medium rounded transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Download size={14} />
                      Export
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {approvedModules.size} of {slides.length > 0 ? Math.max(1, Math.ceil(slides.length / 3)) : 0} modules approved
                  </p>
                </div>

                {/* Modules List */}
                <div className="flex-1 overflow-y-auto">
                  {slides.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No slides yet. Generate slides to continue.</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {/* Group slides by lesson/module */}
                      {slides.map((slide) => (
                        <button
                          key={slide.id}
                          onClick={() => handleSlideClick(slide)}
                          className={`w-full text-left p-3 border-l-4 rounded transition-all ${
                            selectedSlide?.id === slide.id
                              ? 'border-brand-teal bg-brand-teal/10 dark:bg-brand-teal/20'
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">SLIDE {slide.slide_number}</p>
                          <p className="text-xs font-medium text-light-text dark:text-dark-text line-clamp-2">{slide.title || 'Untitled'}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Toggle Menu Button - Show on mobile */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <Menu size={20} />
                </button>

                {/* Slide Detail View */}
                {selectedSlide ? (
                  <div className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6">
                      {/* Slide Header */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
                              {editingSlide ? (
                                <input
                                  type="text"
                                  value={editingSlide.title || ''}
                                  onChange={(e) => updateSlideContent('title', e.target.value)}
                                  className="w-full px-3 py-2 border rounded bg-white dark:bg-slate-700 text-light-text dark:text-dark-text"
                                  placeholder="Slide title"
                                />
                              ) : (
                                selectedSlide.title || 'Untitled Slide'
                              )}
                            </h2>
                            <p className="text-sm text-gray-500">Slide {selectedSlide.slide_number}</p>
                          </div>
                          <div className="flex gap-2">
                            {editingSlide ? (
                              <>
                                <button
                                  onClick={() => setEditingSlide(null)}
                                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={saveSlide}
                                  className="px-4 py-2 bg-brand-teal text-white rounded hover:bg-brand-teal/90 transition"
                                >
                                  Save
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingSlide(selectedSlide)}
                                  className="px-4 py-2 bg-brand-teal text-white rounded hover:bg-brand-teal/90 transition flex items-center gap-2"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteSlide(selectedSlide.id as string)}
                                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-6">
                        {/* Learning Objective */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                            🎯 Learning Objective
                          </h3>
                          {editingSlide ? (
                            <textarea
                              value={editingSlide.learning_objective || ''}
                              onChange={(e) => updateSlideContent('learning_objective', e.target.value)}
                              className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded bg-white dark:bg-slate-700 text-light-text dark:text-dark-text"
                              rows={2}
                              placeholder="What should learners achieve?"
                            />
                          ) : (
                            <p className="text-base text-light-text dark:text-dark-text leading-relaxed">
                              {selectedSlide.learning_objective || 'No objective specified'}
                            </p>
                          )}
                        </div>

                        {/* Content */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                            📝 Content
                          </h3>
                          {editingSlide ? (
                            <textarea
                              value={editingSlide.content || ''}
                              onChange={(e) => updateSlideContent('content', e.target.value)}
                              className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded bg-white dark:bg-slate-700 text-light-text dark:text-dark-text"
                              rows={6}
                              placeholder="Slide content"
                            />
                          ) : (
                            <p className="text-base text-light-text dark:text-dark-text whitespace-pre-wrap leading-relaxed">
                              {selectedSlide.content || 'No content'}
                            </p>
                          )}
                        </div>

                        {/* Media Notes */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                            🎬 Media & Speaker Notes
                          </h3>
                          {editingSlide ? (
                            <textarea
                              value={editingSlide.media_notes || ''}
                              onChange={(e) => updateSlideContent('media_notes', e.target.value)}
                              className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded bg-white dark:bg-slate-700 text-light-text dark:text-dark-text"
                              rows={4}
                              placeholder="Speaker notes, media suggestions..."
                            />
                          ) : (
                            <p className="text-base text-light-text dark:text-dark-text italic leading-relaxed">
                              {selectedSlide.media_notes || 'No notes'}
                            </p>
                          )}
                        </div>

                        {/* Interaction Type */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Interaction Type</h3>
                          {editingSlide ? (
                            <select
                              value={editingSlide.interaction_type || ''}
                              onChange={(e) => updateSlideContent('interaction_type', e.target.value)}
                              className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded bg-white dark:bg-slate-700 text-light-text dark:text-dark-text"
                            >
                              <option value="">Select type</option>
                              <option value="static">Static Content</option>
                              <option value="interactive">Interactive</option>
                              <option value="quiz">Quiz</option>
                              <option value="video">Video</option>
                              <option value="image">Image</option>
                            </select>
                          ) : (
                            <span className="inline-block px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full text-sm">
                              {selectedSlide.interaction_type || 'Not specified'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex gap-4 mt-8 pt-8 border-t border-light-border dark:border-dark-border">
                        <button
                          onClick={() => getPrevSlide() && handleSlideClick(getPrevSlide()!)}
                          disabled={!getPrevSlide()}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ← Previous
                        </button>
                        <div className="flex-1 text-center text-sm text-gray-500">
                          Slide {slides.findIndex(s => s.id === selectedSlide.id) + 1} of {slides.length}
                        </div>
                        <button
                          onClick={() => getNextSlide() && handleSlideClick(getNextSlide()!)}
                          disabled={!getNextSlide()}
                          className="px-4 py-2 bg-brand-teal text-white rounded hover:bg-brand-teal/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      {error ? (
                        <div className="mb-4">
                          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">⚠️ {error}</p>
                          <p className="text-gray-500 text-sm mb-4">Please complete all previous steps first</p>
                          <div className="space-y-2">
                            <button
                              onClick={() => router.push('/create/essentials')}
                              className="block w-full px-4 py-2 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal/90 transition"
                            >
                              Go to Step 1: Essentials
                            </button>
                            <button
                              onClick={() => router.push('/create/modules')}
                              className="block w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                            >
                              Go to Step 2: Modules
                            </button>
                            <button
                              onClick={() => router.push('/create/lessons')}
                              className="block w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition"
                            >
                              Go to Step 3: Lessons
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-500 mb-4">Select a slide from the list to view details</p>
                          {slides.length === 0 && (
                            <button
                              onClick={() => setShowApprovalDialog(true)}
                              className="px-4 py-2 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal/90 transition"
                            >
                              Generate Slides
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Generate Slides from Lessons?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                We&apos;ll analyze your lessons and generate professional e-learning slides using AI (~3 per lesson).
              </p>

              <div className="space-y-2 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">This will:</p>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Generate slide titles and content</li>
                  <li>• Add speaker notes and media suggestions</li>
                  <li>• Follow e-learning best practices</li>
                  <li>• Allow you to edit slides</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovalDialog(false)}
                  disabled={generatingSlides}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-light-text dark:text-dark-text rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateSlides}
                  disabled={generatingSlides}
                  className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-lg font-semibold hover:bg-brand-teal/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingSlides && <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {generatingSlides ? 'Generating...' : 'Generate Slides'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Export Course Storyboard</h2>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'PDF Document', icon: File, value: 'pdf' },
                  { label: 'PowerPoint Presentation', icon: Presentation, value: 'ppt' },
                  { label: 'Word Document', icon: FileText, value: 'word' }
                ].map(({ label, icon: Icon, value }) => (
                  <button
                    key={value}
                    onClick={() => handleExport(value)}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition disabled:opacity-50"
                  >
                    <Icon size={24} className="text-brand-teal" />
                    <span className="text-sm font-medium text-light-text dark:text-dark-text">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-light-text dark:text-dark-text rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  )
}
