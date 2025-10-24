'use client'

// React
import { useEffect, useState } from 'react'

// Next.js
import { useRouter } from 'next/navigation'

// External libraries
import { Clock, BookOpen, Zap, Cpu, Plus, FileText, Trash2, Edit, Crown, Lock, Info } from '@/lib/icons'

// Internal utilities
import { getCourses, deleteCourse, setCurrentDraft, type Course, createNewCourse } from '@/lib/courseStorage'
import { isPremiumUser, canCreateMoreCourses, getCourseLimit } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    // Load courses from storage
    setCourses(getCourses())
    setIsPremium(isPremiumUser())
  }, [])

  // Mock user data
  const userName = 'John'
  const coursesCreated = courses.length
  const timeSaved = coursesCreated * 56 // Approximate hours saved
  const creditsUsed = 750
  const creditsTotal = 1000
  const creditsRemaining = creditsTotal - creditsUsed
  const aiGenerationsUsed = 47
  const canCreateMore = canCreateMoreCourses(coursesCreated)
  const courseLimit = getCourseLimit()

  const handleCreateCourse = () => {
    // Check if user can create more courses
    if (!canCreateMore) {
      const limitText = courseLimit === Infinity ? 'unlimited' : courseLimit
      alert(`Free users can only create up to ${limitText} courses. Please upgrade to Premium for unlimited courses!`)
      return
    }
    
    // Create a new course and navigate to essentials
    const newCourse = createNewCourse()
    router.push('/create/essentials')
  }

  const handleEditCourse = (course: Course) => {
    // Set as current draft and navigate to the appropriate step
    setCurrentDraft(course.id)
    const stepMap: Record<number, string> = {
      1: 'essentials',
      2: 'multimedia',
      3: 'modules',
      4: 'storyboard'
    }
    const stepName = stepMap[course.currentStep] || 'essentials'
    router.push(`/create/${stepName}`)
  }

  const handleDeleteCourse = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      deleteCourse(courseId)
      setCourses(getCourses())
    }
  }

  const getStatusBadge = (status: Course['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      case 'in-progress':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusText = (status: Course['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      default:
        return 'Draft'
    }
  }

  const getDaysRemaining = (completedAt?: string): number | null => {
    if (!completedAt) return null
    const completed = new Date(completedAt)
    const now = new Date()
    const expiryDate = new Date(completed)
    expiryDate.setDate(expiryDate.getDate() + 90) // Add 90 days
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft > 0 ? daysLeft : 0
  }

  const getExpiryBadgeColor = (daysRemaining: number) => {
    if (daysRemaining <= 7) return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    if (daysRemaining <= 30) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* HEADER SECTION */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
              Welcome back, {userName}!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Here&apos;s what&apos;s happening with your courses today
            </p>
          </div>
          <button
            onClick={handleCreateCourse}
            className="px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Course
          </button>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Stat Card 1: Time Saved */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-lg bg-brand-teal/10 flex items-center justify-center mb-3">
              <Clock size={24} className="text-brand-teal" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {timeSaved}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              hours
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Time Saved with AI
            </div>
            <div className="text-xs text-brand-teal font-medium">
              vs manual creation
            </div>
          </div>

          {/* Stat Card 2: Courses Created */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-lg bg-brand-teal/10 flex items-center justify-center mb-3">
              <BookOpen size={24} className="text-brand-teal" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {coursesCreated}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Courses Created
            </div>
            <div className="text-xs text-brand-teal font-medium">
              +2 this month
            </div>
          </div>

          {/* Stat Card 3: Credits Remaining */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-lg bg-brand-teal/10 flex items-center justify-center mb-3">
              <Zap size={24} className="text-brand-teal" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {creditsRemaining}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              credits
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Credits Remaining
            </div>
            <div className="text-xs text-brand-teal font-medium">
              Get more
            </div>
          </div>

          {/* Stat Card 4: AI Generations */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-105 transition-all border border-gray-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-lg bg-brand-teal/10 flex items-center justify-center mb-3">
              <Cpu size={24} className="text-brand-teal" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {aiGenerationsUsed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              AI Generations
            </div>
            <div className="text-xs text-brand-teal font-medium">
              Content & structure generated
            </div>
          </div>
        </div>

        {/* COURSES SECTION */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-slate-700">
          
          {courses.length === 0 ? (
            // Empty State
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-brand-teal" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Ready to Create Your Course?
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Start building engaging, AI-powered courses in minutes.
              </p>
              <button
                onClick={handleCreateCourse}
                disabled={!canCreateMore}
                className={`px-6 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 ${
                  canCreateMore 
                    ? 'bg-brand-teal hover:bg-brand-cyan text-white transform hover:scale-105' 
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {canCreateMore ? <Plus size={20} /> : <Lock size={20} />}
                {canCreateMore ? 'Create Course' : 'Limit Reached - Upgrade'}
              </button>
            </div>
          ) : (
            // Courses List
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Courses
                </h2>
                <button
                  onClick={handleCreateCourse}
                  disabled={!canCreateMore}
                  className={`px-4 py-2 font-semibold rounded-lg transition-all inline-flex items-center gap-2 ${
                    canCreateMore 
                      ? 'bg-brand-teal hover:bg-brand-cyan text-white' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canCreateMore ? <Plus size={18} /> : <Lock size={18} />}
                  {canCreateMore ? 'New Course' : 'Upgrade to Create More'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const daysRemaining = getDaysRemaining(course.completedAt)
                  return (
                  <div
                    key={course.id}
                    className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 border-2 border-gray-200 dark:border-slate-700 hover:border-brand-teal transition-all"
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(course.status)}`}>
                        {getStatusText(course.status)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Step {course.currentStep}/4
                      </span>
                    </div>

                    {/* Expiration Countdown for Completed Courses */}
                    {course.status === 'completed' && daysRemaining !== null && (
                      <div className={`px-3 py-2 rounded-lg text-xs font-semibold mb-3 flex items-center gap-2 ${getExpiryBadgeColor(daysRemaining)}`}>
                        <Clock size={14} />
                        {daysRemaining > 0 ? (
                          <span>Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>
                        ) : (
                          <span>Expired - Re-export to extend</span>
                        )}
                      </div>
                    )}

                    {/* Course Title */}
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white line-clamp-2">
                      {course.courseTitle || course.title}
                    </h3>

                    {/* Course Stats */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-4">
                      {course.numberOfModules && course.numberOfModules > 0 && (
                        <div className="flex items-center gap-1.5">
                          <FileText size={14} className="text-brand-teal" />
                          <span className="font-medium">{course.numberOfModules} Module{course.numberOfModules !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {course.lessons && course.lessons.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={14} className="text-brand-teal" />
                          <span className="font-medium">{course.lessons.length} Lesson{course.lessons.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {course.numberOfModules && course.numberOfModules > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-brand-teal" />
                          <span className="font-medium">~{course.numberOfModules * 15} min</span>
                        </div>
                      )}
                    </div>

                    {/* Last Updated */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Updated {new Date(course.updatedAt).toLocaleDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="flex-1 px-4 py-2 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        {course.status === 'completed' ? 'Edit' : 'Continue'}
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          )}
        </div>

        {/* COURSE LIMIT INFO - Show below courses section for free users */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 mt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Info size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
                  Free Plan: {coursesCreated}/{courseLimit === Infinity ? '∞' : courseLimit} Courses Used
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  {canCreateMore 
                    ? courseLimit === Infinity
                      ? 'You have unlimited courses!'
                      : `You can create ${courseLimit - coursesCreated} more course${courseLimit - coursesCreated !== 1 ? 's' : ''} on the free plan.`
                    : 'You\'ve reached the free plan limit.'
                  }
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                  💡 <strong>Tip:</strong> If you want to create more courses, you can delete previous courses after exporting them, 
                  or <button 
                    onClick={() => router.push('/pricing')}
                    className="underline font-semibold hover:text-blue-600 dark:hover:text-blue-200 transition-colors"
                  >
                    upgrade to Premium
                  </button> for unlimited course storage.
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2 text-sm"
                >
                  <Crown size={16} />
                  View Premium Plans
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
