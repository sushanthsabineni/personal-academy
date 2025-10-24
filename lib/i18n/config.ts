// Supported languages configuration
export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
] as const

export type LanguageCode = typeof languages[number]['code']

export const defaultLanguage: LanguageCode = 'en'

// Get language from localStorage or default
export function getCurrentLanguage(): LanguageCode {
  if (typeof window === 'undefined') return defaultLanguage
  
  const stored = localStorage.getItem('preferred-language')
  if (stored && languages.some(lang => lang.code === stored)) {
    return stored as LanguageCode
  }
  
  return defaultLanguage
}

// Save language preference
export function setCurrentLanguage(code: LanguageCode) {
  if (typeof window === 'undefined') return
  localStorage.setItem('preferred-language', code)
}

// Get language name by code
export function getLanguageName(code: LanguageCode): string {
  return languages.find(lang => lang.code === code)?.name || 'English'
}

// Get language flag by code
export function getLanguageFlag(code: LanguageCode): string {
  return languages.find(lang => lang.code === code)?.flag || '🇬🇧'
}
