// Admin Configuration Management
// Stores all configurable settings for the platform

export interface AICreditRates {
  learningOutcomes: number;
  modules: number;
  lessons: number;
  quiz: number;
  assessments: number;
  certificates: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number; // in INR
  credits: number;
  features: string[];
  isPopular?: boolean;
}

export interface PlatformSettings {
  currencySymbol: string;
  currencyCode: string;
  exchangeRate: number; // USD to INR
  platformName: string;
  supportEmail: string;
  maxCoursesPerUser: number;
  enableReferrals: boolean;
  referralCredits: number;
}

export interface AdminConfig {
  aiCreditRates: AICreditRates;
  pricingPlans: PricingPlan[];
  platformSettings: PlatformSettings;
  lastUpdated: string;
}

// Default Configuration
const DEFAULT_CONFIG: AdminConfig = {
  aiCreditRates: {
    learningOutcomes: 10,
    modules: 15,
    lessons: 20,
    quiz: 12,
    assessments: 18,
    certificates: 5,
  },
  pricingPlans: [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      credits: 100,
      features: [
        '100 AI Credits',
        'Create up to 3 courses',
        'Basic templates',
        'Email support',
        'Community access',
      ],
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 4150, // ≈$50 * 83
      credits: 1000,
      isPopular: true,
      features: [
        '1000 AI Credits',
        'Unlimited courses',
        'Premium templates',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'Export options',
      ],
    },
  ],
  platformSettings: {
    currencySymbol: '₹',
    currencyCode: 'INR',
    exchangeRate: 83, // 1 USD = 83 INR
    platformName: 'Personal Academy',
    supportEmail: 'support@personalacademy.com',
    maxCoursesPerUser: 50,
    enableReferrals: true,
    referralCredits: 50,
  },
  lastUpdated: new Date().toISOString(),
};

const CONFIG_STORAGE_KEY = 'adminConfig';

// Get current configuration
export function getAdminConfig(): AdminConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;
  }

  const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse admin config:', error);
      return DEFAULT_CONFIG;
    }
  }
  
  // Initialize with default config
  saveAdminConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

// Save configuration
export function saveAdminConfig(config: AdminConfig): void {
  if (typeof window === 'undefined') return;
  
  const configWithTimestamp = {
    ...config,
    lastUpdated: new Date().toISOString(),
  };
  
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configWithTimestamp));
}

// Update AI Credit Rates
export function updateAICreditRates(rates: AICreditRates): void {
  const config = getAdminConfig();
  config.aiCreditRates = rates;
  saveAdminConfig(config);
}

// Update Pricing Plans
export function updatePricingPlans(plans: PricingPlan[]): void {
  const config = getAdminConfig();
  config.pricingPlans = plans;
  saveAdminConfig(config);
}

// Update Platform Settings
export function updatePlatformSettings(settings: Partial<PlatformSettings>): void {
  const config = getAdminConfig();
  config.platformSettings = { ...config.platformSettings, ...settings };
  saveAdminConfig(config);
}

// Get specific settings
export function getAICreditRates(): AICreditRates {
  return getAdminConfig().aiCreditRates;
}

export function getPricingPlans(): PricingPlan[] {
  return getAdminConfig().pricingPlans;
}

export function getPlatformSettings(): PlatformSettings {
  return getAdminConfig().platformSettings;
}

// Currency Formatter
export function formatINR(amount: number): string {
  const settings = getPlatformSettings();
  return `${settings.currencySymbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// Convert USD to INR
export function convertUSDtoINR(usdAmount: number): number {
  const settings = getPlatformSettings();
  return usdAmount * settings.exchangeRate;
}

// Reset to defaults (useful for testing)
export function resetToDefaults(): void {
  saveAdminConfig(DEFAULT_CONFIG);
}
