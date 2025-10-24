// Course storage and management utilities
// Uses localStorage for persistence

export interface Course {
  id: string
  title: string
  description: string
  status: 'draft' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
  completedAt?: string // Timestamp when course was marked as completed
  currentStep: number
  
  // Step 1 data
  courseTitle?: string
  targetAudience?: string
  learningObjectives?: string
  numberOfModules?: number
  
  // Step 2 data
  modules?: Array<{
    id: number
    title: string
    description: string
  }>
  
  // Step 3 data
  lessons?: Array<{
    id: number
    moduleId: number
    title: string
    description: string
  }>
  
  // Step 4 data
  storyboard?: any // Complete storyboard data
}

// Get all courses
export const getCourses = (): Course[] => {
  if (typeof window === 'undefined') return []
  
  const coursesJson = localStorage.getItem('courses')
  if (!coursesJson) return []
  
  try {
    return JSON.parse(coursesJson)
  } catch {
    return []
  }
}

// Get a single course by ID
export const getCourse = (id: string): Course | null => {
  const courses = getCourses()
  return courses.find(c => c.id === id) || null
}

// Save a course (create or update)
export const saveCourse = (course: Course): void => {
  const courses = getCourses()
  const existingIndex = courses.findIndex(c => c.id === course.id)
  
  course.updatedAt = new Date().toISOString()
  
  if (existingIndex >= 0) {
    courses[existingIndex] = course
  } else {
    courses.push(course)
  }
  
  localStorage.setItem('courses', JSON.stringify(courses))
}

// Delete a course
export const deleteCourse = (id: string): void => {
  const courses = getCourses()
  const filtered = courses.filter(c => c.id !== id)
  localStorage.setItem('courses', JSON.stringify(filtered))
}

// Get the current draft course (the one being edited)
export const getCurrentDraft = (): Course | null => {
  if (typeof window === 'undefined') return null
  
  const draftId = sessionStorage.getItem('currentDraftId')
  if (!draftId) return null
  
  return getCourse(draftId)
}

// Set the current draft course
export const setCurrentDraft = (courseId: string): void => {
  sessionStorage.setItem('currentDraftId', courseId)
}

// Clear the current draft
export const clearCurrentDraft = (): void => {
  sessionStorage.removeItem('currentDraftId')
}

// Create a new course
export const createNewCourse = (): Course => {
  const newCourse: Course = {
    id: 'course-' + Date.now(),
    title: 'Untitled Course',
    description: '',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 1
  }
  
  saveCourse(newCourse)
  setCurrentDraft(newCourse.id)
  
  return newCourse
}

// Update course progress
export const updateCourseProgress = (
  courseId: string,
  step: number,
  data: Partial<Course>
): void => {
  const course = getCourse(courseId)
  if (!course) return
  
  const updatedCourse: Course = {
    ...course,
    ...data,
    currentStep: Math.max(course.currentStep, step),
    status: step === 4 && data.storyboard ? 'completed' : 'in-progress'
  }
  
  saveCourse(updatedCourse)
}
