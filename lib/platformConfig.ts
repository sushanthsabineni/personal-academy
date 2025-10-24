// Centralized Platform Configuration
// All app-wide settings that can be controlled from admin panel

export interface ReferralConfig {
  enabled: boolean
  referrerBonusPercentage: number // % of credits referrer gets when referee purchases
  refereeBonusCredits: number // Flat bonus for new user signing up with referral
  milestones: {
    count: number
    rewardCredits: number
    rewardBadge?: string
    rewardDescription: string
  }[]
}

export interface FeatureFlags {
  enableReferrals: boolean
  enableCourseExport: boolean
  enableSCORMExport: boolean
  enablePDFExport: boolean
  enablePPTExport: boolean
  enableWordExport: boolean
  enableAIEnhancement: boolean
  enableAnalytics: boolean
  enableCommunity: boolean
}

export interface CourseLimits {
  freePlanLimit: number
  premiumPlanLimit: number // Use -1 for unlimited
  maxModulesPerCourse: number
  maxLessonsPerModule: number
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  priceINR: number
  priceUSD: number
  priceGBP: number
  priceAUD: number
  savings: number // percentage
  features: string[]
  highlighted: boolean
  popular: boolean
}

export interface EmailTemplates {
  welcome: {
    subject: string
    body: string
  }
  purchaseConfirmation: {
    subject: string
    body: string
  }
  referralEarned: {
    subject: string
    body: string
  }
  lowCredits: {
    subject: string
    body: string
  }
}

export interface PlatformConfig {
  referrals: ReferralConfig
  featureFlags: FeatureFlags
  courseLimits: CourseLimits
  creditPackages: CreditPackage[]
  emailTemplates: EmailTemplates
  platformSettings: {
    platformName: string
    supportEmail: string
    tagline: string
    enableAutoDetectCurrency: boolean
    defaultCurrency: string
    maintenanceMode: boolean
    maintenanceMessage: string
  }
  lastUpdated: string
}

// Default Configuration
const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  referrals: {
    enabled: true,
    referrerBonusPercentage: 20,
    refereeBonusCredits: 500,
    milestones: [
      { count: 1, rewardCredits: 500, rewardBadge: 'First Referral', rewardDescription: '500 credits + Badge' },
      { count: 5, rewardCredits: 5000, rewardBadge: 'Community Builder', rewardDescription: '5,000 credits + Discord Access' },
      { count: 10, rewardCredits: 20000, rewardBadge: 'Influencer', rewardDescription: '20,000 credits + Hall of Fame' },
      { count: 25, rewardCredits: 50000, rewardBadge: 'Ambassador', rewardDescription: 'Affiliate program (15% recurring)' },
    ],
  },
  featureFlags: {
    enableReferrals: true,
    enableCourseExport: true,
    enableSCORMExport: false, // Coming soon
    enablePDFExport: true,
    enablePPTExport: true,
    enableWordExport: true,
    enableAIEnhancement: true,
    enableAnalytics: true,
    enableCommunity: false,
  },
  courseLimits: {
    freePlanLimit: 3,
    premiumPlanLimit: -1, // Unlimited
    maxModulesPerCourse: 20,
    maxLessonsPerModule: 15,
  },
  creditPackages: [
    {
      id: 'starter',
      name: 'Starter',
      credits: 1000,
      priceINR: 999,
      priceUSD: 15,
      priceGBP: 11,
      priceAUD: 23,
      savings: 0,
      features: [
        'Perfect for getting started',
        '4 complete storyboards',
        'Up to 3 saved courses',
        'Standard export formats',
        'Email support',
      ],
      highlighted: false,
      popular: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      credits: 3000,
      priceINR: 2699,
      priceUSD: 41,
      priceGBP: 32,
      priceAUD: 63,
      savings: 10,
      features: [
        'Best for active creators',
        '12 complete storyboards',
        'Unlimited course storage',
        'All export formats + SCORM',
        'Priority support',
        'AI enhancement features',
      ],
      highlighted: false,
      popular: true,
    },
    {
      id: 'scale',
      name: 'Scale',
      credits: 5000,
      priceINR: 4249,
      priceUSD: 65,
      priceGBP: 51,
      priceAUD: 100,
      savings: 15,
      features: [
        'Maximum value & savings',
        '20 complete storyboards',
        'Unlimited course storage',
        'All premium features',
        'Dedicated support',
        'Advanced analytics',
        'Priority feature access',
      ],
      highlighted: true,
      popular: false,
    },
  ],
  emailTemplates: {
    welcome: {
      subject: 'Welcome to {{platformName}}!',
      body: 'Hi {{userName}},\n\nWelcome to {{platformName}}! You have {{credits}} credits to start creating amazing courses.\n\nBest regards,\nThe {{platformName}} Team',
    },
    purchaseConfirmation: {
      subject: 'Purchase Confirmation - {{credits}} Credits',
      body: 'Hi {{userName}},\n\nThank you for your purchase! {{credits}} credits have been added to your account.\n\nTransaction ID: {{transactionId}}\n\nBest regards,\nThe {{platformName}} Team',
    },
    referralEarned: {
      subject: 'You earned {{credits}} bonus credits!',
      body: 'Hi {{userName}},\n\nGreat news! {{referredUser}} just signed up using your referral code and you earned {{credits}} bonus credits!\n\nKeep sharing to earn more!\n\nBest regards,\nThe {{platformName}} Team',
    },
    lowCredits: {
      subject: 'Your credits are running low',
      body: 'Hi {{userName}},\n\nYou have {{credits}} credits remaining. Purchase more credits to continue creating amazing courses!\n\nBest regards,\nThe {{platformName}} Team',
    },
  },
  platformSettings: {
    platformName: 'Personal Academy',
    supportEmail: 'support@personalacademy.com',
    tagline: 'Create AI-Powered Course Storyboards in Minutes',
    enableAutoDetectCurrency: true,
    defaultCurrency: 'INR',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently undergoing maintenance. Please check back soon!',
  },
  lastUpdated: new Date().toISOString(),
}

const PLATFORM_CONFIG_KEY = 'platformConfig'

// Get platform configuration
export function getPlatformConfig(): PlatformConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_PLATFORM_CONFIG
  }

  const stored = localStorage.getItem(PLATFORM_CONFIG_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Failed to parse platform config:', error)
      return DEFAULT_PLATFORM_CONFIG
    }
  }

  // Initialize with default
  savePlatformConfig(DEFAULT_PLATFORM_CONFIG)
  return DEFAULT_PLATFORM_CONFIG
}

// Save platform configuration
export function savePlatformConfig(config: PlatformConfig): void {
  if (typeof window === 'undefined') return

  const configWithTimestamp = {
    ...config,
    lastUpdated: new Date().toISOString(),
  }

  localStorage.setItem(PLATFORM_CONFIG_KEY, JSON.stringify(configWithTimestamp))
}

// Update specific sections
export function updateReferralConfig(config: Partial<ReferralConfig>): void {
  const platformConfig = getPlatformConfig()
  platformConfig.referrals = { ...platformConfig.referrals, ...config }
  savePlatformConfig(platformConfig)
}

export function updateFeatureFlags(flags: Partial<FeatureFlags>): void {
  const platformConfig = getPlatformConfig()
  platformConfig.featureFlags = { ...platformConfig.featureFlags, ...flags }
  savePlatformConfig(platformConfig)
}

export function updateCourseLimits(limits: Partial<CourseLimits>): void {
  const platformConfig = getPlatformConfig()
  platformConfig.courseLimits = { ...platformConfig.courseLimits, ...limits }
  savePlatformConfig(platformConfig)
}

export function updateCreditPackages(packages: CreditPackage[]): void {
  const platformConfig = getPlatformConfig()
  platformConfig.creditPackages = packages
  savePlatformConfig(platformConfig)
}

export function updatePlatformSettings(settings: Partial<PlatformConfig['platformSettings']>): void {
  const platformConfig = getPlatformConfig()
  platformConfig.platformSettings = { ...platformConfig.platformSettings, ...settings }
  savePlatformConfig(platformConfig)
}

export function updateEmailTemplate(
  templateKey: keyof EmailTemplates,
  template: { subject: string; body: string }
): void {
  const platformConfig = getPlatformConfig()
  platformConfig.emailTemplates[templateKey] = template
  savePlatformConfig(platformConfig)
}

// Getter functions for specific configs
export function getReferralConfig(): ReferralConfig {
  return getPlatformConfig().referrals
}

export function getFeatureFlags(): FeatureFlags {
  return getPlatformConfig().featureFlags
}

export function getCourseLimits(): CourseLimits {
  return getPlatformConfig().courseLimits
}

export function getCreditPackages(): CreditPackage[] {
  return getPlatformConfig().creditPackages
}

export function getPlatformSettings(): PlatformConfig['platformSettings'] {
  return getPlatformConfig().platformSettings
}

export function getEmailTemplates(): EmailTemplates {
  return getPlatformConfig().emailTemplates
}

// Helper: Check if feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatureFlags()[feature]
}

// Helper: Get course limit for user type
export function getCourseLimit(isPremium: boolean): number {
  const limits = getCourseLimits()
  return isPremium ? limits.premiumPlanLimit : limits.freePlanLimit
}

// Helper: Calculate referral reward
export function calculateReferralReward(purchaseAmount: number): number {
  const config = getReferralConfig()
  if (!config.enabled) return 0
  return Math.floor((purchaseAmount * config.referrerBonusPercentage) / 100)
}

// Reset to defaults
export function resetPlatformConfigToDefaults(): void {
  savePlatformConfig(DEFAULT_PLATFORM_CONFIG)
}
