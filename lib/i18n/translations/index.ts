import { en } from './en'
import { es } from './es'
import type { LanguageCode } from '../config'

// Placeholder translations for other languages - these should be properly translated
// For now, they'll use English as fallback through the translation hook
const de = en // German - to be translated
const pt = en // Portuguese - to be translated
const it = en // Italian - to be translated
const fr = en // French - to be translated
const pl = en // Polish - to be translated
const zh = en // Simplified Chinese - to be translated

export const translations: Record<LanguageCode, typeof en> = {
  en,
  es,
  de,
  pt,
  it,
  fr,
  pl,
  zh
}
