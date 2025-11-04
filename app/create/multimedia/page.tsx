'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCourseSidebar } from '@/components/layout/CreateCourseSidebar'
import { StepNavigation } from '@/components/layout/StepNavigation'
import { Mic, ImageIcon, Video, HelpCircle, Sparkles, Check } from '@/lib/icons'
import { supabase, checkAuth } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type BlueprintType = 'scenario_based' | 'software_sim' | 'video_based' | 'game_based' | 'microlearning'
type QuizStrategy = 'every_module' | 'end_of_course' | 'pre_post' | 'ai_decide'
type MultimediaOptionId = 'audioNarration' | 'imageGeneration' | 'videoContent' | 'knowledgeAssessments' | 'animationMotion'

// Blueprint cards removed; mapping continues via dropdown selection only.

// Course type dropdown with expectations; also drives DB fields via mapping below
const courseTypeOptions: Array<{
  value: string
  label: string
  expectation: string
}> = [
  {
    value: 'simple_text',
    label: 'Simple Text-Based',
    expectation:
      'Concise, text-first outputs: structured outlines, bullet points, and minimal multimedia. Fastest to create and easy to iterate.',
  },
  {
    value: 'micro_learning',
    label: 'Microlearning',
    expectation:
      'Short modules with focused objectives, bite-sized interactions, and quick checks. Optimized for just-in-time learning.',
  },
  {
    value: 'interactive_course',
    label: 'Interactive Course',
    expectation:
      'Engaging interactions (click-to-reveal, hotspots, branching micro-scenarios) and learner input paths, emphasizing active learning.',
  },
  {
    value: 'video_based',
    label: 'Video-Based Learning',
    expectation:
      'Shot lists, camera angles, narration scripts, and graphic overlays. Clear production guidance and timing notes.',
  },
  {
    value: 'scenario_based',
    label: 'Scenario-Based Learning',
    expectation:
      'Branching scenarios with decision points, consequences, and dialogue. Emphasis on real-world application and practice.',
  },
  {
    value: 'game_based',
    label: 'Game-Based Learning',
    expectation:
      'Game mechanics, scoring, levels, and rewards. Focus on motivation and progressive challenges with feedback loops.',
  },
  {
    value: 'software_sim',
    label: 'Software Simulations',
    expectation:
      'Click paths, screen captures, hotspots, and error scenarios. Step-by-step guidance to master software workflows.',
  },
]

// Map dropdown selection to DB fields
function mapDropdownToDb(selection: string): { course_type: 'simple' | 'interactive' | 'highly_interactive' | 'scenario_driven'; blueprint: BlueprintType | null } {
  switch (selection) {
    case 'simple_text':
      return { course_type: 'simple', blueprint: null }
    case 'micro_learning':
      return { course_type: 'simple', blueprint: 'microlearning' }
    case 'interactive_course':
      return { course_type: 'interactive', blueprint: null }
    case 'video_based':
      return { course_type: 'interactive', blueprint: 'video_based' }
    case 'scenario_based':
      return { course_type: 'scenario_driven', blueprint: 'scenario_based' }
    case 'game_based':
      return { course_type: 'highly_interactive', blueprint: 'game_based' }
    case 'software_sim':
      return { course_type: 'interactive', blueprint: 'software_sim' }
    default:
      return { course_type: 'simple', blueprint: null }
  }
}

// Map DB row back to dropdown value
function mapDbToDropdown(courseType: string | null | undefined, blueprint: string | null | undefined): string {
  const b = (blueprint || '').toLowerCase()
  if (b === 'microlearning') return 'micro_learning'
  if (b === 'video_based') return 'video_based'
  if (b === 'scenario_based') return 'scenario_based'
  if (b === 'game_based') return 'game_based'
  if (b === 'software_sim') return 'software_sim'
  const ct = (courseType || '').toLowerCase()
  if (ct === 'interactive' || ct === 'highly_interactive') return 'interactive_course'
  if (ct === 'scenario_driven') return 'scenario_based'
  return 'simple_text'
}

// Voice & Tone options with expectations
const voiceToneOptions: Array<{
  value: '' | 'professional' | 'friendly' | 'storytelling' | 'guiding' | 'authoritative'
  label: string
  expectation: string
}> = [
  { value: '', label: 'Let AI decide', expectation: 'AI will choose a suitable tone based on context and target audience.' },
  { value: 'professional', label: 'Professional', expectation: 'Formal, precise, and business-like language with clear structure.' },
  { value: 'friendly', label: 'Friendly', expectation: 'Warm, approachable and supportive tone that reduces cognitive load.' },
  { value: 'storytelling', label: 'Storytelling', expectation: 'Narrative, example-driven explanations that build engagement through stories.' },
  { value: 'guiding', label: 'Guiding', expectation: 'Mentor-like instructions with step-by-step guidance and encouragement.' },
  { value: 'authoritative', label: 'Authoritative', expectation: 'Expert, confident voice with decisive guidance and strong recommendations.' },
]

const quizStrategyOptions: Array<{ value: QuizStrategy; label: string }> = [
  { value: 'every_module', label: 'Every module' },
  { value: 'end_of_course', label: 'End of course' },
  { value: 'pre_post', label: 'Pre & post' },
  { value: 'ai_decide', label: 'Let AI decide' },
]

const multimediaOptions: Array<{
  id: MultimediaOptionId
  icon: typeof Mic
  title: string
  description: string
  badge?: string
  hasDropdown?: boolean
}> = [
  {
    id: 'audioNarration',
    icon: Mic,
    title: 'Audio Narration Script',
    description: 'AI-generated voiceover scripts to bring each slide to life.',
    badge: 'Recommended',
  },
  {
    id: 'imageGeneration',
    icon: ImageIcon,
    title: 'Image Generation Prompts',
    description: 'Smart prompts that help you create stunning visuals instantly.',
    badge: 'Popular',
  },
  {
    id: 'videoContent',
    icon: Video,
    title: 'Video Content Prompts',
    description: 'Curated ideas for building compelling video content.',
  },
  {
    id: 'knowledgeAssessments',
    icon: HelpCircle,
    title: 'Knowledge Assessments',
    description: 'Interactive quizzes to reinforce learning and measure progress.',
    badge: 'Essential',
    hasDropdown: true,
  },
  {
    id: 'animationMotion',
    icon: Sparkles,
    title: 'Animation & Motion',
    description: 'Dynamic transitions and animated storytelling elements.',
    badge: 'Premium',
  },
]

const defaultSelections: Record<MultimediaOptionId, boolean> = {
  audioNarration: false,
  imageGeneration: false,
  videoContent: false,
  knowledgeAssessments: false,
  animationMotion: false,
}

const normalizeBlueprintType = (value: unknown): BlueprintType | '' => {
  const v = typeof value === 'string' ? value : ''
  if (['scenario_based','software_sim','video_based','game_based','microlearning'].includes(v)) return v as BlueprintType
  return ''
}

const isQuizStrategy = (value: unknown): value is QuizStrategy => {
  if (typeof value !== 'string') return false
  return quizStrategyOptions.some(option => option.value === value)
}


export default function CourseStep2() {
  const router = useRouter()
  const [courseId, setCourseId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [blueprintType, setBlueprintType] = useState<BlueprintType | ''>('')
  const [blueprintTouched, setBlueprintTouched] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<MultimediaOptionId, boolean>>({ ...defaultSelections })
  const [quizOption, setQuizOption] = useState<QuizStrategy>('ai_decide')
  const [voiceTone, setVoiceTone] = useState<string>('')
  const [courseTypeInfo, setCourseTypeInfo] = useState<string>('')
  const [courseType, setCourseType] = useState<'simple' | 'interactive' | 'highly_interactive' | 'scenario_driven'>('simple')
  const [courseTypeSelection, setCourseTypeSelection] = useState<string>('')
  const [voiceToneInfo, setVoiceToneInfo] = useState<string>('')

  // Load course from DB
  useEffect(() => {
    async function loadCourse() {
      const user = await checkAuth()
      if (!user) {
        router.push('/dashboard')
        setLoading(false)
        return
      }
      setUserId(user.id)
      // Find latest draft or in-progress course for user
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['draft', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1);
      if (coursesError) {
        console.error('Error loading course for multimedia step:', coursesError)
        setLoading(false)
        return
      }
      const course: Database['public']['Tables']['courses']['Row'] | null = courses && courses.length > 0 ? courses[0] : null;
      if (!course) {
        router.push('/create/essentials')
        setLoading(false)
        return
      }
      setCourseId((course as any).id)
      const normalizedType = normalizeBlueprintType((course as any).course_blueprint_type) || ''
      setBlueprintType(normalizedType)
      setBlueprintTouched(Boolean(normalizedType))
      const dropdownSel = mapDbToDropdown((course as any).course_type as string | null, (course as any).course_blueprint_type as string | null)
      setCourseTypeSelection(dropdownSel)
      setCourseType(mapDropdownToDb(dropdownSel).course_type)
      const ctInfo = courseTypeOptions.find(o => o.value === dropdownSel)?.expectation || ''
      setCourseTypeInfo(ctInfo)
      const vt = ((course as any).voice_tone as string) || ''
      const vtInfo = voiceToneOptions.find(o => o.value === (vt as any))?.expectation || ''
      setVoiceToneInfo(vtInfo)
      setVoiceTone(((course as any).voice_tone as string) || '')
      setSelectedOptions({
        ...defaultSelections,
        audioNarration: Boolean((course as any).audio_narration),
        imageGeneration: Boolean((course as any).image_generation),
        videoContent: Boolean((course as any).video_content),
        animationMotion: Boolean((course as any).animation_motion),
        knowledgeAssessments: Boolean((course as any).knowledge_assessments),
      })
      setQuizOption(isQuizStrategy((course as any).knowledge_assessments)
        ? (course as any).knowledge_assessments as QuizStrategy
        : 'ai_decide')
      setIsInitialized(true)
      setLoading(false)
    }
    loadCourse()
  }, [router])

  const selectedCount = Object.values(selectedOptions).filter(Boolean).length
  const engagementEstimate = selectedCount * 15
  const selectedCourseTypeLabel = courseTypeOptions.find(o => o.value === courseTypeSelection)?.label

  // Persist changes to DB
  useEffect(() => {
    if (!isInitialized || !courseId || !userId) return
    const timer = setTimeout(async () => {
      await (supabase
        .from('courses') as any)
        .update({
          course_type: courseType,
          course_blueprint_type: blueprintType || null,
          voice_tone: voiceTone ? voiceTone : null,
          audio_narration: selectedOptions.audioNarration,
          image_generation: selectedOptions.imageGeneration,
          video_content: selectedOptions.videoContent,
          animation_motion: selectedOptions.animationMotion,
          knowledge_assessments: selectedOptions.knowledgeAssessments ? quizOption : null,
          engagement_percentage: selectedCount ? engagementEstimate : null,
          current_step: 2,
        })
        .eq('id', courseId)
      setHasUnsavedChanges(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [courseId, blueprintType, voiceTone, selectedOptions, quizOption, engagementEstimate, selectedCount, isInitialized, userId])

  // Disable/auto-select multimedia options based on selected course type
  const isOptionDisabled = (id: MultimediaOptionId): boolean => {
    if (courseTypeSelection === 'simple_text') return true
    if (courseTypeSelection === 'video_based' && id === 'knowledgeAssessments') return true
    return false
  }

  useEffect(() => {
    if (!isInitialized) return
    setSelectedOptions(prev => {
      const next = { ...prev }
      if (courseTypeSelection === 'simple_text') {
        next.audioNarration = false
        next.imageGeneration = false
        next.videoContent = false
        next.animationMotion = false
        next.knowledgeAssessments = false
        if (quizOption !== 'ai_decide') setQuizOption('ai_decide')
      } else if (courseTypeSelection === 'video_based') {
        next.audioNarration = true
        next.videoContent = true
        next.knowledgeAssessments = false
        if (quizOption !== 'ai_decide') setQuizOption('ai_decide')
      }
      const changed = Object.keys(prev).some(k => (prev as any)[k] !== (next as any)[k])
      if (changed) setHasUnsavedChanges(true)
      return next
    })
  }, [courseTypeSelection, isInitialized])

  // When dropdown changes, update both course_type and blueprint (mapped)
  const handleCourseTypeSelect = (value: string) => {
    setCourseTypeSelection(value)
    const mapped = mapDropdownToDb(value)
    setCourseType(mapped.course_type)
    setBlueprintType(mapped.blueprint || '')
    setBlueprintTouched(true)
    const info = courseTypeOptions.find(o => o.value === value)?.expectation || ''
    setCourseTypeInfo(info)
    setHasUnsavedChanges(true)
  }

  const toggleOption = (id: MultimediaOptionId) => {
    setSelectedOptions(prev => {
      const nextValue = !prev[id]
      const nextSelections = { ...prev, [id]: nextValue }

      if (id === 'knowledgeAssessments' && !nextValue) {
        setQuizOption('ai_decide')
      }

      return nextSelections
    })
    setHasUnsavedChanges(true)
  }

  const handleVoiceToneSelect = (value: string) => {
    setVoiceTone(value)
    const info = voiceToneOptions.find(o => o.value === (value as any))?.expectation || ''
    setVoiceToneInfo(info)
    setHasUnsavedChanges(true)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-slate-900">
      <CreateCourseSidebar />

      <main
        className="flex-1 pb-12 transition-[padding-left] duration-300"
        style={{ paddingLeft: 'var(--create-sidebar-width, 5rem)' }}
      >
        <div className="w-full px-6 py-2 border-b border-light-border dark:border-dark-border">
          <div className="max-w-full mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-light-text dark:text-dark-text mb-1">
                Enhance Your Course
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
                Select the experience and multimedia elements you want the AI to generate for your learners.
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                  }`}
                ></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {hasUnsavedChanges ? 'Saving...' : 'All changes saved'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-8">
          {/* Loading skeleton */}
          {loading && (
            <div className="mb-10 animate-pulse">
              <div className="h-24 rounded-2xl bg-gray-200 dark:bg-slate-800 mb-6" />
              <div className="h-10 rounded-lg bg-gray-200 dark:bg-slate-800 mb-4" />
              <div className="h-16 rounded-lg bg-gray-200 dark:bg-slate-800 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-40 rounded-2xl bg-gray-200 dark:bg-slate-800" />
                <div className="h-40 rounded-2xl bg-gray-200 dark:bg-slate-800" />
              </div>
            </div>
          )}

          <div className={loading ? 'hidden' : 'mb-8 p-5 bg-[#4fd1c5] dark:bg-[#4fd1c5] rounded-2xl shadow-xl text-white'}>
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-xs text-white/80 mb-1">Elements Selected</p>
                <p className="text-2xl font-bold">
                  {selectedCount} / {multimediaOptions.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/80 mb-1">Estimated Engagement Boost</p>
                <p className="text-xl font-semibold">+{engagementEstimate}%</p>
              </div>
            </div>
            {selectedCourseTypeLabel && (
              <div className="mt-4 border-t border-white/20 pt-4 flex items-center justify-between text-sm">
                <span className="text-white/70">Course Type</span>
                <span className="font-semibold">{selectedCourseTypeLabel}</span>
              </div>
            )}
          </div>

          <section className={loading ? 'hidden' : 'mb-12'}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Content Blueprint</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select the overall course type; AI will adapt structure and output accordingly.</p>
            </div>
            {/* Single dropdown selection driving DB fields */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Type
                </label>
                <select
                  onChange={(e) => handleCourseTypeSelect(e.target.value)}
                  value={courseTypeSelection}
                  className="w-full h-11 px-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all"
                >
                  <option value="" disabled>Select course type</option>
                  {courseTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden md:block" />
              {courseTypeInfo && (
                <div className="md:col-span-2 p-4 rounded-xl border-2 border-brand-teal/30 bg-white dark:bg-slate-900">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">What to expect:</span> {courseTypeInfo}
                  </p>
                </div>
              )}
            </div>
            {/* Removed redundant blueprint tiles; dropdown above is the single source of truth */}
            {!courseTypeSelection && blueprintTouched && (
              <p className="mt-2 text-sm text-red-500">Please select a course type to continue.</p>
            )}
          </section>

          <section className={loading ? 'hidden' : 'mb-12'}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Voice & Tone</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select the writing voice to guide AI phrasing, formality, and personality. Choose "Let AI decide" to allow automatic selection.
              </p>
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voice & Tone</label>
                <select
                  value={voiceTone}
                  onChange={(e) => handleVoiceToneSelect(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all"
                >
                  {voiceToneOptions.map(opt => (
                    <option key={opt.value || 'ai_decide'} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="hidden md:block" />
              {voiceToneInfo && (
                <div className="md:col-span-2 p-4 rounded-xl border-2 border-brand-teal/30 bg-white dark:bg-slate-900">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">What to expect:</span> {voiceToneInfo}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* All blueprints support multimedia options; no special-casing needed */}

          <section className={loading ? 'hidden' : 'mb-12'}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Multimedia Options</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select which elements the AI should generate: audio narration scripts, image prompts, video prompts,
                knowledge assessments, and animations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {multimediaOptions.map(option => {
                const Icon = option.icon
                const isSelected = selectedOptions[option.id]
                const isDisabled = isOptionDisabled(option.id)

              return (
                <div key={option.id} className="group">
                  <div
                    onClick={isDisabled ? undefined : () => toggleOption(option.id)}
                    className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                      isDisabled ? 'cursor-not-allowed opacity-60 pointer-events-none' : 'cursor-pointer'
                    } ${
                      isSelected
                        ? 'bg-gradient-to-br from-brand-teal/10 to-brand-cyan/10 dark:from-brand-teal/20 dark:to-brand-cyan/20 border-2 border-brand-teal shadow-lg shadow-brand-teal/20'
                        : 'bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-brand-teal/50 hover:shadow-md'
                    }`}
                  >
                    {option.badge && (
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            option.badge === 'Recommended'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : option.badge === 'Popular'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                : option.badge === 'Essential'
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {option.badge}
                        </span>
                        {option.hasDropdown && isSelected && (
                          <div className="mt-2">
                            <select
                              value={quizOption}
                              onChange={event => {
                                setQuizOption(event.target.value as QuizStrategy)
                                setHasUnsavedChanges(true)
                              }}
                              className="w-40 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-orange-300 dark:border-orange-700 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-teal transition-all"
                              onClick={event => event.stopPropagation()}
                            >
                              {quizStrategyOptions.map(strategy => (
                                <option key={strategy.value} value={strategy.value}>
                                  {strategy.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`absolute top-6 left-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-brand-teal border-brand-teal text-white'
                          : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-transparent'
                      }`}
                    >
                      <Check size={14} />
                    </div>

                    <div className="mt-12">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                          isSelected
                            ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/30'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Icon size={24} />
                      </div>

                      <h3
                        className={`text-lg font-semibold mb-2 transition-colors ${
                          isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{option.description}</p>
                    </div>

                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-brand-teal/5 to-brand-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                        isSelected ? 'hidden' : ''
                      }`}
                    ></div>
                  </div>
                </div>
              )
            })}
            </div>
          </section>

          <div className={loading ? 'hidden' : 'mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl backdrop-blur-sm'}>
            <p className="text-sm text-blue-900 dark:text-blue-200 text-center">
              <strong>Pro Tip:</strong> Selected elements will be woven into each module automatically, tailored to your chosen
              course type.
            </p>
          </div>

          {!loading && (
            <StepNavigation currentStep={2} isValid={Boolean(courseTypeSelection)} />
          )}
        </div>
      </main>
    </div>
  )
}
