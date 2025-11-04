// Course storage and management utilities
// Uses Supabase for persistence

type CourseTypeValue = 'simple' | 'interactive' | 'highly_interactive' | 'scenario_driven'
type KnowledgeAssessmentStrategy = 'every_module' | 'end_of_course' | 'pre_post' | 'ai_decide'

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
  courseType?: CourseTypeValue
  audioNarration?: boolean
  imageGeneration?: boolean
  videoContent?: boolean
  knowledgeAssessments?: KnowledgeAssessmentStrategy | null
  animationMotion?: boolean
  engagementPercentage?: number | null
  
  // Step 3 data
  modules?: Array<{
    id: number
    title: string
    description: string
  }>
  lessons?: Array<{
    id: number
    moduleId: number
    title: string
    description: string
  }>
  structuredModules?: Array<{
    id: number
    title: string
    description: string
    duration?: string
    approved?: boolean
    lessons: Array<{
      title: string
      description: string
      duration?: string
    }>
  }>
  
  // Step 4 data
  storyboard?: Record<string, unknown> // Complete storyboard data
}


// Get all courses from Supabase (API only, no localStorage fallback)
export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await fetch('/api/courses')
    if (response.ok) {
      const result = await response.json()
      return result.data || []
    }
    // If API fails, return empty array
    console.warn('API fetch failed')
    return []
  } catch (error) {
    console.error('Error fetching courses from API:', error)
    return []
  }
}

// Get a single course by ID from Supabase
export const getCourse = async (id: string): Promise<Course | null> => {
  try {
    const response = await fetch(`/api/courses/${id}`)
    if (!response.ok) {
      console.error('Failed to fetch course:', response.statusText)
      return null
    }
    
    const result = await response.json()
    return result.data || null
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}


// Save a course (create or update) - API only (no localStorage)
export const saveCourse = async (): Promise<boolean> => {
  // Placeholder for future API implementation
  return true;
}


// Delete a course from Supabase (API only, no localStorage fallback)
export const deleteCourse = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      return true
    }
    // If API fails, return false
    console.warn('API delete failed')
    return false
  } catch (error) {
    console.error('Error deleting course from API:', error)
    return false
  }
}


