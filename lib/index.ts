// Library Utilities Barrel Export
// Enables cleaner imports: import { login, getCourses } from '@/lib'

// Note: Some modules have overlapping function names, so they're grouped under namespaces
// to avoid conflicts. Use specific imports when needed.

// Auth functions
export {
  login,
  logout,
  isAuthenticated,
  isProtectedRoute,
  getUserInfo,
  isPremiumUser,
  canCreateMoreCourses
} from './auth'

// Course storage functions
export {
  getCourses,
  getCurrentDraft,
  setCurrentDraft,
  updateCourseProgress,
  createNewCourse,
  deleteCourse,
  clearCurrentDraft,
  type Course
} from './courseStorage'

// Credit management
export * from './creditManagement'

// Legal content
export * from './legalContent'

// Google auth
export * from './google-auth'

// Platform config - Use specific imports or import entire module
export type {
  ReferralConfig,
  FeatureFlags,
  CourseLimits,
  CreditPackage,
  PlatformConfig
} from './platformConfig'

// Admin utilities - Grouped under namespaces
export * as adminAuth from './adminAuth'
export * as adminConfig from './adminConfig'
export * as adminData from './adminData'
export * as expenses from './expenses'
