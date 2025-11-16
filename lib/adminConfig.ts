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

export interface AIPromptConfig {
  // AI Provider settings
  aiProvider: 'openrouter' | 'direct';
  
  // OpenRouter specific
  openrouterApiKey?: string; // Stored encrypted in browser
  openrouterModel: string; // e.g., 'openai/gpt-4o'
  openrouterFallbackModels: string[]; // Fallback options if primary fails

  // Direct API settings (legacy, for backwards compatibility)
  model: 'gpt-4' | 'gpt-4o' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'gemini-2.0-flash';
  
  // Common parameters
  temperature: number; // 0-2, default 0.7
  maxTokens: number;
  topP: number; // 0-1, default 1
  frequencyPenalty: number; // -2 to 2, default 0
  presencePenalty: number; // -2 to 2, default 0
  
  // Prompts
  courseStructurePrompt: string;
  moduleGenerationPrompt: string;
  lessonGenerationPrompt: string;
  quizGenerationPrompt: string;
  assessmentPrompt: string;
  contentEnhancementPrompt: string;
  narrativePrompt: string;
  useSystemPrompt: boolean;
  systemPromptText: string;
}

export interface AdminConfig {
  aiCreditRates: AICreditRates;
  aiPromptConfig: AIPromptConfig;
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
  aiPromptConfig: {
    // OpenRouter configuration (primary)
    aiProvider: 'openrouter',
    openrouterApiKey: undefined,
    openrouterModel: 'openai/gpt-4o',
    openrouterFallbackModels: [
      'openai/gpt-4-turbo',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-sonnet',
      'google/gemini-1.5-pro',
    ],

    // Direct API configuration (legacy)
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    courseStructurePrompt: `You are an expert instructional designer. Generate a comprehensive course structure based on the provided information. Include modules with learning objectives, and suggested lesson topics.`,
    moduleGenerationPrompt: `You are an expert course creator. Generate detailed modules with lessons for the given course topic. Each module should have 3-5 lessons with clear descriptions.`,
    lessonGenerationPrompt: `You are an expert educator. Create detailed lesson content including learning objectives, key concepts, examples, and practice questions.`,
    quizGenerationPrompt: `You are an expert assessment designer. Create challenging quiz questions that test understanding of the concepts. Include multiple-choice and short-answer questions.`,
    assessmentPrompt: `You are an expert in creating comprehensive assessments. Design a full assessment that evaluates learners' mastery of the course material.`,
    contentEnhancementPrompt: `You are an expert content editor. Improve and enhance the provided content to make it more engaging, clear, and pedagogically sound.`,
    narrativePrompt: `You are an expert scriptwriter. Write engaging narration scripts for course content that are suitable for voice-over.`,
    useSystemPrompt: true,
    systemPromptText: `You are Personal Academy's AI instructor assistant. Your role is to help create high-quality, engaging educational content. Follow these guidelines:
- Be clear and concise
- Use pedagogically sound approaches
- Include real-world examples
- Encourage active learning
- Maintain professional but friendly tone
- Adapt to the target audience level`,
  },
  platformSettings: {
    currencySymbol: '₹',
    currencyCode: 'INR',
    exchangeRate: 83, // 1 USD = 83 INR
    platformName: 'Personal Academy',
    supportEmail: 'support@personalacademy.app',
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

  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // Defensive: ensure all required properties exist
        if (!parsed.aiPromptConfig) {
          console.warn('Stored config missing aiPromptConfig, reinitializing');
          saveAdminConfig(DEFAULT_CONFIG);
          return DEFAULT_CONFIG;
        }
        
        if (!parsed.aiCreditRates) {
          console.warn('Stored config missing aiCreditRates, reinitializing');
          saveAdminConfig(DEFAULT_CONFIG);
          return DEFAULT_CONFIG;
        }
        
        if (!parsed.pricingPlans) {
          console.warn('Stored config missing pricingPlans, reinitializing');
          saveAdminConfig(DEFAULT_CONFIG);
          return DEFAULT_CONFIG;
        }
        
        if (!parsed.platformSettings) {
          console.warn('Stored config missing platformSettings, reinitializing');
          saveAdminConfig(DEFAULT_CONFIG);
          return DEFAULT_CONFIG;
        }
        
        return parsed as AdminConfig;
      } catch (parseError) {
        console.error('Failed to parse admin config from localStorage:', parseError);
        // Clear the corrupted data
        localStorage.removeItem(CONFIG_STORAGE_KEY);
        saveAdminConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
      }
    }
    
    // No stored config, initialize with defaults
    saveAdminConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Error in getAdminConfig:', error);
    return DEFAULT_CONFIG;
  }
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

export function getAIPromptConfig(): AIPromptConfig {
  if (typeof window === 'undefined') {
    // Server-side: return default (this will be overridden by async function)
    return DEFAULT_CONFIG.aiPromptConfig;
  }
  
  try {
    // Client-side: get from config (which gets from localStorage)
    const config = getAdminConfig();
    
    // Ensure aiPromptConfig exists and is complete
    if (!config || !config.aiPromptConfig) {
      console.warn('Admin config missing aiPromptConfig, returning defaults');
      return DEFAULT_CONFIG.aiPromptConfig;
    }
    
    // Merge with defaults to ensure all fields are present
    const merged = {
      ...DEFAULT_CONFIG.aiPromptConfig,
      ...config.aiPromptConfig,
    };
    
    return merged;
  } catch (error) {
    console.error('Failed to get AI prompt config:', error);
    return DEFAULT_CONFIG.aiPromptConfig;
  }
}

export function updateAIPromptConfig(config: Partial<AIPromptConfig>): void {
  const currentConfig = getAdminConfig();
  currentConfig.aiPromptConfig = { ...currentConfig.aiPromptConfig, ...config };
  saveAdminConfig(currentConfig);
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
