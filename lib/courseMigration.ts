/**
 * LocalStorage to Supabase Course Migration Utility
 * 
 * This utility helps migrate existing courses from localStorage to Supabase database.
 * Run this once after deploying the Supabase-backed course system.
 */

import { supabase } from './supabase/client'

interface LegacyCourse {
  id: string
  title: string
  description: string
  status: 'draft' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
  completedAt?: string
  currentStep: number
  courseTitle?: string
  targetAudience?: string
  learningObjectives?: string
  numberOfModules?: number
  modules?: unknown[]
  lessons?: unknown[]
  storyboard?: Record<string, unknown>
}

/**
 * Migrate courses from localStorage to Supabase
 * Returns: { success: number, failed: number, errors: string[] }
 */
export async function migrateLocalStorageCourses(): Promise<{
  success: number
  failed: number
  errors: string[]
  migratedCourses: string[]
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    migratedCourses: [] as string[]
  }

  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      results.errors.push('User not authenticated. Please log in first.')
      return results
    }

    // Get courses from localStorage
    const coursesJson = localStorage.getItem('courses')
    if (!coursesJson) {
      results.errors.push('No courses found in localStorage')
      return results
    }

    const localCourses: LegacyCourse[] = JSON.parse(coursesJson)
    
    if (!Array.isArray(localCourses) || localCourses.length === 0) {
      results.errors.push('No valid courses to migrate')
      return results
    }

    console.log(`Found ${localCourses.length} courses in localStorage`)

    // Migrate each course
    for (const course of localCourses) {
      try {
        // Map localStorage course to Supabase course format
        const courseData = {
          // Use existing ID or generate UUID
          id: course.id.startsWith('course-') ? undefined : course.id,
          user_id: session.user.id,
          title: course.courseTitle || course.title || 'Untitled Course',
          description: course.description || '',
          status: mapStatus(course.status),
          target_audience: course.targetAudience || null,
          learning_objectives: course.learningObjectives || null,
          knowledge_level: 'beginner', // Default
          estimated_duration: course.numberOfModules ? course.numberOfModules * 30 : null,
          
          // Metadata
          created_at: course.createdAt,
          updated_at: course.updatedAt,
          completed_at: course.completedAt || null,
          
          // Store full course data as metadata
          metadata: {
            migrated_from: 'localStorage',
            migration_date: new Date().toISOString(),
            original_id: course.id,
            current_step: course.currentStep,
            modules: course.modules,
            lessons: course.lessons,
            storyboard: course.storyboard
          }
        }

        // Insert into Supabase
        const { error } = await supabase
          .from('courses')
          .insert(courseData)
          .select()
          .single()

        if (error) {
          throw error
        }

        results.success++
        results.migratedCourses.push(course.title || course.id)
        console.log(`✅ Migrated: ${course.title || course.id}`)

      } catch (error) {
        results.failed++
        const errorMsg = `Failed to migrate "${course.title || course.id}": ${error instanceof Error ? error.message : 'Unknown error'}`
        results.errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    // If all courses migrated successfully, offer to clear localStorage
    if (results.success === localCourses.length && results.failed === 0) {
      console.log('🎉 All courses migrated successfully!')
      console.log('You can now safely clear localStorage by calling: clearLegacyCourses()')
    }

  } catch (error) {
    results.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return results
}

/**
 * Map localStorage status to Supabase status
 */
function mapStatus(status: string): 'draft' | 'in_progress' | 'completed' | 'archived' {
  switch (status) {
    case 'in-progress':
      return 'in_progress'
    case 'completed':
      return 'completed'
    case 'draft':
    default:
      return 'draft'
  }
}

/**
 * Clear localStorage courses after successful migration
 * ⚠️ CAUTION: Only call this after verifying migration was successful!
 */
export function clearLegacyCourses(): void {
  if (confirm('Are you sure you want to clear localStorage courses? This cannot be undone!')) {
    localStorage.removeItem('courses')
    console.log('✅ localStorage courses cleared')
  }
}

/**
 * Backup localStorage courses to JSON file
 */
export function backupLocalStorageCourses(): void {
  try {
    const coursesJson = localStorage.getItem('courses')
    if (!coursesJson) {
      alert('No courses found in localStorage')
      return
    }

    const blob = new Blob([coursesJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `courses-backup-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log('✅ Courses backed up successfully')
  } catch (error) {
    console.error('❌ Backup failed:', error)
    alert('Failed to backup courses')
  }
}

/**
 * Usage Instructions:
 * 
 * 1. Open browser console on your dashboard
 * 2. Import the migration utility:
 *    import { migrateLocalStorageCourses, backupLocalStorageCourses, clearLegacyCourses } from '@/lib/courseMigration'
 * 
 * 3. (Optional) Backup your courses first:
 *    backupLocalStorageCourses()
 * 
 * 4. Run the migration:
 *    const result = await migrateLocalStorageCourses()
 *    console.log(result)
 * 
 * 5. Verify courses appear in dashboard
 * 
 * 6. If everything looks good, clear localStorage:
 *    clearLegacyCourses()
 */
