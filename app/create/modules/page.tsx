'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreateCourseSidebar } from '@/components/layout/CreateCourseSidebar'
import { StepNavigation } from '@/components/layout/StepNavigation'
import { BookOpen, Clock, Edit3, Sparkles, Check, ChevronRight, Target, TrendingUp, Layers } from '@/lib/icons'
import { getCurrentDraft, updateCourseProgress } from '@/lib/courseStorage'

type Lesson = {
  title: string
  description: string
  duration: string
}

type Module = {
  id: number
  title: string
  description: string
  duration: string
  lessons: Lesson[]
  approved: boolean
}

export default function CourseStep3() {
  const [courseId, setCourseId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const [modules, setModules] = useState<Module[]>([
    {
      id: 0,
      title: 'Fundamentals',
      description: 'Learn the essential basics and foundational concepts needed to get started.',
      duration: '15 min',
      approved: false,
      lessons: [
        { title: 'Getting Started', description: 'Introduction to the course and what you will learn throughout the journey.', duration: '5 min' },
        { title: 'Key Concepts', description: 'Core principles and fundamental ideas that form the foundation.', duration: '5 min' },
        { title: 'Deep Dive', description: 'Explore the fundamentals in detail with practical examples.', duration: '5 min' },
      ],
    },
    {
      id: 1,
      title: 'Core Skills',
      description: 'Build practical skills through hands-on exercises and real-world applications.',
      duration: '18 min',
      approved: false,
      lessons: [
        { title: 'Skill Overview', description: 'Understanding the key skills you need to master for success.', duration: '6 min' },
        { title: 'Hands-on Practice', description: 'Apply your knowledge with practical exercises and activities.', duration: '6 min' },
        { title: 'Advanced Techniques', description: 'Learn professional-level techniques to enhance your capabilities.', duration: '6 min' },
      ],
    },
    {
      id: 2,
      title: 'Application',
      description: 'Apply your knowledge to real-world scenarios and practical case studies.',
      duration: '17 min',
      approved: false,
      lessons: [
        { title: 'Real-world Examples', description: 'See how concepts are applied in actual industry scenarios.', duration: '5 min' },
        { title: 'Case Studies', description: 'Analyze detailed case studies to understand practical implementation.', duration: '6 min' },
        { title: 'Problem Solving', description: 'Develop critical thinking skills to solve complex challenges.', duration: '6 min' },
      ],
    },
    {
      id: 3,
      title: 'Mastery',
      description: 'Achieve expert-level understanding and learn best practices from industry leaders.',
      duration: '15 min',
      approved: false,
      lessons: [
        { title: 'Expert Insights', description: 'Learn from experts and gain valuable professional insights.', duration: '5 min' },
        { title: 'Best Practices', description: 'Discover industry-standard practices and proven methodologies.', duration: '5 min' },
        { title: 'Next Steps', description: 'Plan your continued learning journey and future growth path.', duration: '5 min' },
      ],
    },
  ])

  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  const [editingModule, setEditingModule] = useState<number | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ moduleId: number; lessonIdx: number } | null>(null)

  // Load course ID from current draft
  useEffect(() => {
    const currentDraft = getCurrentDraft()
    if (currentDraft) {
      setCourseId(currentDraft.id)
      // Load saved modules if available
      // (for now, keep mock data)
    }
    setTimeout(() => setIsInitialized(true), 100)
  }, [])

  // Auto-save changes with debounce
  useEffect(() => {
    if (isInitialized && courseId && modules.length > 0) {
      setHasUnsavedChanges(true)
      
      const saveTimeout = setTimeout(() => {
        updateCourseProgress(courseId, 3, {
          modules: modules.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description
          })),
          numberOfModules: modules.length
        })
        setHasUnsavedChanges(false)
      }, 2000)
      
      return () => clearTimeout(saveTimeout)
    }
  }, [modules, courseId, isInitialized])

  const toggleApproval = (id: number) => {
    setModules(modules.map(m => 
      m.id === id ? { ...m, approved: !m.approved } : m
    ))
  }

  const approveAll = () => {
    setModules(modules.map(m => ({ ...m, approved: true })))
  }

  const handleModuleEdit = (moduleId: number, field: 'title' | 'description', value: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, [field]: value } : m
    ))
  }

  const handleLessonEdit = (moduleId: number, lessonIdx: number, field: 'title' | 'description', value: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const updatedLessons = [...m.lessons]
        updatedLessons[lessonIdx] = { ...updatedLessons[lessonIdx], [field]: value }
        return { ...m, lessons: updatedLessons }
      }
      return m
    }))
  }

  const handleEnhanceWithAI = (moduleId: number) => {
    alert(`Enhancing module with AI...`)
  }

  const handleLessonAIEnhance = (moduleId: number, lessonIdx: number) => {
    alert(`Enhancing lesson with AI...`)
  }

  const approvedCount = modules.filter(m => m.approved).length
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalDuration = modules.reduce((sum, m) => sum + parseInt(m.duration), 0)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-slate-900">
      <CreateCourseSidebar />

      {/* Main Content */}
      <main className="flex-1 pl-20 lg:pl-20 pt-6 pb-12 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 bg-gradient-to-r from-brand-teal to-brand-cyan bg-clip-text text-transparent">
              Review Course Structure
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              AI generated {modules.length} modules with {totalLessons} lessons • Approve and customize as needed
            </p>
            {/* Auto-save indicator */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasUnsavedChanges ? 'Saving...' : 'All changes saved'}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Approval Progress */}
            <div className="bg-gradient-to-br from-brand-teal to-brand-cyan rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target size={20} />
                <p className="text-sm font-medium opacity-90">Approved</p>
              </div>
              <p className="text-3xl font-bold">{approvedCount}/{modules.length}</p>
              <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(approvedCount / modules.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Total Lessons */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} className="text-purple-500" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lessons</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalLessons}</p>
            </div>

            {/* Duration */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-blue-500" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalDuration} min</p>
            </div>

            {/* Modules */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={20} className="text-orange-500" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Modules</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{modules.length}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={approveAll}
              className="px-5 py-2.5 bg-brand-teal hover:bg-brand-cyan text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-brand-teal/30"
            >
              <Check size={18} />
              Approve All Modules
            </button>
            <button
              onClick={() => alert('Regenerating structure...')}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all flex items-center gap-2 border border-gray-300 dark:border-slate-600"
            >
              <Sparkles size={18} />
              Regenerate Structure
            </button>
          </div>

          {/* Learning Journey Timeline */}
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={module.id} className="group">
                {/* Module Card */}
                <div className={`
                  relative bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                  ${module.approved 
                    ? 'border-brand-teal shadow-lg shadow-brand-teal/10' 
                    : 'border-gray-200 dark:border-slate-700 hover:border-brand-teal/50 hover:shadow-md'
                  }
                `}>
                  
                  {/* Approved Badge */}
                  {module.approved && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="px-3 py-1 bg-brand-teal text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg">
                        <Check size={12} />
                        Approved
                      </div>
                    </div>
                  )}

                  {/* Module Number Badge */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-brand-teal to-brand-cyan flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>

                  {/* Module Content */}
                  <div className="p-6 pl-20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Title & Edit */}
                        <div className="flex items-center gap-3 mb-3">
                          {editingModule === module.id ? (
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => handleModuleEdit(module.id, 'title', e.target.value)}
                              className="flex-1 px-3 py-2 text-2xl font-bold bg-gray-50 dark:bg-slate-900 border-2 border-brand-teal rounded-lg text-gray-900 dark:text-white focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            <>
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {module.title}
                              </h2>
                              <button
                                onClick={() => setEditingModule(editingModule === module.id ? null : module.id)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                              >
                                <Edit3 size={16} className="text-gray-400" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Description */}
                        {editingModule === module.id ? (
                          <textarea
                            value={module.description}
                            onChange={(e) => handleModuleEdit(module.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border-2 border-brand-teal rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none mb-3"
                          />
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            {module.description}
                          </p>
                        )}

                        {/* Lesson Preview */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1.5">
                            <BookOpen size={16} />
                            <span>{module.lessons.length} lessons</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={16} />
                            <span>{module.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp size={16} />
                            <span>Progressive difficulty</span>
                          </div>
                        </div>

                        {/* Lesson Pills */}
                        {expandedModule !== module.id && (
                          <div className="flex flex-wrap gap-2">
                            {module.lessons.map((lesson, idx) => (
                              <div 
                                key={idx}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-full text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 bg-brand-teal rounded-full"></span>
                                {lesson.title}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Expanded Lessons */}
                        {expandedModule === module.id && (
                          <div className="mt-4 space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
                            {module.lessons.map((lesson, idx) => (
                              <div 
                                key={idx}
                                className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="flex items-center justify-center w-6 h-6 bg-brand-teal/20 text-brand-teal rounded-full text-xs font-bold">
                                        {idx + 1}
                                      </span>
                                      {editingLesson?.moduleId === module.id && editingLesson?.lessonIdx === idx ? (
                                        <input
                                          type="text"
                                          value={lesson.title}
                                          onChange={(e) => handleLessonEdit(module.id, idx, 'title', e.target.value)}
                                          className="flex-1 px-2 py-1 text-sm font-semibold bg-white dark:bg-slate-800 border-2 border-brand-teal rounded text-gray-900 dark:text-white focus:outline-none"
                                          autoFocus
                                        />
                                      ) : (
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                          {lesson.title}
                                        </h4>
                                      )}
                                    </div>
                                    {editingLesson?.moduleId === module.id && editingLesson?.lessonIdx === idx ? (
                                      <textarea
                                        value={lesson.description}
                                        onChange={(e) => handleLessonEdit(module.id, idx, 'description', e.target.value)}
                                        rows={2}
                                        className="w-full ml-8 px-2 py-1 text-sm bg-white dark:bg-slate-800 border-2 border-brand-teal rounded text-gray-600 dark:text-gray-400 focus:outline-none"
                                      />
                                    ) : (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                                        {lesson.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* Edit/Save Button */}
                                    <button
                                      onClick={() => setEditingLesson(
                                        editingLesson?.moduleId === module.id && editingLesson?.lessonIdx === idx
                                          ? null
                                          : { moduleId: module.id, lessonIdx: idx }
                                      )}
                                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-slate-600 transition-all flex items-center gap-1"
                                    >
                                      <Edit3 size={12} />
                                      {editingLesson?.moduleId === module.id && editingLesson?.lessonIdx === idx ? 'Save' : 'Edit'}
                                    </button>
                                    {/* AI Enhance Button */}
                                    <button
                                      onClick={() => handleLessonAIEnhance(module.id, idx)}
                                      className="px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all flex items-center gap-1 border border-purple-200 dark:border-purple-800"
                                    >
                                      <Sparkles size={12} />
                                      AI
                                    </button>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                      {lesson.duration}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        {/* Approve Toggle */}
                        <button
                          onClick={() => toggleApproval(module.id)}
                          className={`
                            p-3 rounded-lg border-2 transition-all
                            ${module.approved
                              ? 'bg-brand-teal border-brand-teal text-white hover:bg-brand-cyan'
                              : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-400 hover:border-brand-teal hover:text-brand-teal'
                            }
                          `}
                        >
                          <Check size={20} />
                        </button>

                        {/* AI Enhancement */}
                        <button
                          onClick={() => handleEnhanceWithAI(module.id)}
                          className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all border border-purple-200 dark:border-purple-800"
                        >
                          <Sparkles size={20} />
                        </button>

                        {/* Expand/Collapse */}
                        <button
                          onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                          className={`
                            p-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-all
                            ${expandedModule === module.id ? 'rotate-90' : ''}
                          `}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Save Button (when editing) */}
                    {editingModule === module.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <button
                          onClick={() => setEditingModule(null)}
                          className="px-4 py-2 bg-brand-teal hover:bg-brand-cyan text-white font-medium rounded-lg transition-all"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Connector Line (except last) */}
                  {index < modules.length - 1 && (
                    <div className="absolute left-8 -bottom-4 w-0.5 h-4 bg-gradient-to-b from-brand-teal to-transparent"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-900 dark:text-blue-200 text-center">
              <strong>Pro Tip:</strong> Approve modules you&apos;re satisfied with, or use AI enhancement to automatically improve content quality and engagement
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-8">
            <StepNavigation 
              currentStep={3}
              isValid={approvedCount > 0}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
