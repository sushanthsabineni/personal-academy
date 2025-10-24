// Google Analytics 4 Event Tracking Utilities
// Use these functions to track user interactions and conversions

/**
 * Track custom Google Analytics events
 * Requires NEXT_PUBLIC_GA_MEASUREMENT_ID environment variable
 * 
 * @example
 * trackEvent('purchase', { credits: 1000, amount: 10 })
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  // Only track in production with GA enabled
  if (typeof window === 'undefined' || !window.gtag) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4 Dev]', eventName, eventParams)
    }
    return
  }

  try {
    window.gtag('event', eventName, eventParams)
  } catch (error) {
    console.error('GA4 tracking error:', error)
  }
}

/**
 * Track page views (automatic with Next.js but can be called manually)
 */
export function trackPageView(url: string, title?: string) {
  trackEvent('page_view', {
    page_path: url,
    page_title: title || document.title
  })
}

/**
 * Track user sign up
 */
export function trackSignUp(method: 'email' | 'google' | 'github' = 'email') {
  trackEvent('sign_up', {
    method
  })
}

/**
 * Track user login
 */
export function trackLogin(method: 'email' | 'google' | 'github' = 'email') {
  trackEvent('login', {
    method
  })
}

/**
 * Track credit purchase
 */
export function trackPurchase(credits: number, amount: number, currency: string = 'USD') {
  trackEvent('purchase', {
    value: amount,
    currency,
    credits,
    transaction_id: `txn_${Date.now()}`
  })
}

/**
 * Track course creation started
 */
export function trackCourseCreateStart(step: number = 1) {
  trackEvent('course_create_start', {
    step,
    step_name: getStepName(step)
  })
}

/**
 * Track course creation step completed
 */
export function trackCourseStepComplete(step: number) {
  trackEvent('course_step_complete', {
    step,
    step_name: getStepName(step)
  })
}

/**
 * Track course creation fully completed
 */
export function trackCourseCreateComplete(courseData: {
  courseTitle: string
  industry: string
  modulesCount: number
  lessonsCount: number
}) {
  trackEvent('course_create_complete', {
    course_title: courseData.courseTitle,
    industry: courseData.industry,
    modules_count: courseData.modulesCount,
    lessons_count: courseData.lessonsCount
  })
}

/**
 * Track AI generation usage
 */
export function trackAIGeneration(
  generationType: 'modules' | 'lessons' | 'slides' | 'enhancement',
  creditsUsed: number
) {
  trackEvent('ai_generation', {
    generation_type: generationType,
    credits_used: creditsUsed
  })
}

/**
 * Track export action
 */
export function trackExport(
  exportType: 'pdf' | 'ppt' | 'word',
  contentType: 'storyboard' | 'course' | 'invoice'
) {
  trackEvent('export', {
    export_type: exportType,
    content_type: contentType
  })
}

/**
 * Track referral link share
 */
export function trackReferralShare(method: 'copy' | 'email' | 'social') {
  trackEvent('referral_share', {
    method,
    value: 500 // bonus credits value
  })
}

/**
 * Track successful referral (when referred user signs up)
 */
export function trackReferralComplete(referralCode: string) {
  trackEvent('referral_complete', {
    referral_code: referralCode,
    value: 500
  })
}

/**
 * Track search queries
 */
export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount
  })
}

/**
 * Track video/tutorial views
 */
export function trackVideoView(videoTitle: string, duration?: number) {
  trackEvent('video_view', {
    video_title: videoTitle,
    ...(duration && { duration })
  })
}

/**
 * Track errors for monitoring
 */
export function trackError(errorMessage: string, errorType: string) {
  trackEvent('exception', {
    description: errorMessage,
    error_type: errorType,
    fatal: false
  })
}

/**
 * Track feature usage
 */
export function trackFeatureUse(featureName: string, details?: Record<string, string | number>) {
  trackEvent('feature_use', {
    feature_name: featureName,
    ...details
  })
}

/**
 * Track premium upgrade interest
 */
export function trackPremiumInterest(source: 'pricing_page' | 'course_limit' | 'dashboard') {
  trackEvent('premium_interest', {
    source
  })
}

/**
 * Track file upload
 */
export function trackFileUpload(fileType: string, fileSize: number) {
  trackEvent('file_upload', {
    file_type: fileType,
    file_size_kb: Math.round(fileSize / 1024)
  })
}

// Helper function to get step names
function getStepName(step: number): string {
  const stepNames: Record<number, string> = {
    1: 'essentials',
    2: 'modules',
    3: 'multimedia',
    4: 'storyboard'
  }
  return stepNames[step] || 'unknown'
}

// Extend Window type to include gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void
  }
}
