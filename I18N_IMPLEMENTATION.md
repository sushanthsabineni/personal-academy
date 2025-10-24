# Internationalization (i18n) Setup

## Overview

Personal Academy now supports 8 languages with a simple language switcher in the footer.

## Supported Languages

1. 🇬🇧 English (en) - Complete
2. 🇪🇸 Spanish (es) - Complete
3. 🇩🇪 German (de) - Using English fallback
4. 🇵🇹 Portuguese (pt) - Using English fallback
5. 🇮🇹 Italian (it) - Using English fallback
6. 🇫🇷 French (fr) - Using English fallback
7. 🇵🇱 Polish (pl) - Using English fallback
8. 🇨🇳 Simplified Chinese (zh) - Using English fallback

## Architecture

### Translation Files

- `lib/i18n/config.ts` - Language configuration and utilities
- `lib/i18n/useTranslation.tsx` - Translation context provider and hook
- `lib/i18n/translations/en.ts` - English translations (base)
- `lib/i18n/translations/es.ts` - Spanish translations
- `lib/i18n/translations/index.ts` - Export all translations

### Components

- `components/layout/LanguageSwitcher.tsx` - Language dropdown component
- Added to Footer component in bottom left corner

## Usage

### In Components

```tsx
'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'

export function MyComponent() {
  const { t, language, setLanguage } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('dashboard.welcomeBack')}</p>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('es')}>Switch to Spanish</button>
    </div>
  )
}
```

### Translation Keys

All translations follow a nested structure:

```typescript
{
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel"
  },
  dashboard: {
    welcomeBack: "Welcome back",
    myCourses: "My Courses"
  },
  // ... more categories
}
```

### Available Categories

- `common` - Common UI elements (buttons, labels, etc.)
- `nav` - Navigation items
- `header` - Header component text
- `footer` - Footer component text
- `dashboard` - Dashboard page
- `courseCreation` - Course creation wizard
- `comingSoon` - Coming soon page
- `help` - Help center
- `faq` - FAQ page
- `tutorials` - Tutorials page
- `apiDocs` - API documentation
- `pricing` - Pricing page
- `auth` - Authentication pages
- `messages` - System messages and notifications

## Translation Structure

Each language file exports a complete translation object:

```typescript
export const en = {
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    // ...
  },
  // ... more categories
}
```

## Language Persistence

- Language preference is stored in `localStorage`
- Key: `'language'`
- Default: `'en'` (English)
- Changes trigger a page reload to apply translations globally

## Adding New Languages

To add a new language:

1. Add language to `lib/i18n/config.ts`:
```typescript
export const languages = [
  // ... existing languages
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
]
```

2. Update LanguageCode type:
```typescript
export type LanguageCode = 'en' | 'es' | 'de' | 'pt' | 'it' | 'fr' | 'pl' | 'zh' | 'ja'
```

3. Create translation file `lib/i18n/translations/ja.ts`:
```typescript
import type { TranslationKeys } from './en'

export const ja: TranslationKeys = {
  // ... translate all keys
}
```

4. Add to translations index:
```typescript
import { ja } from './ja'

export const translations: Record<LanguageCode, typeof en> = {
  // ... existing
  ja
}
```

## Fallback Behavior

- If a translation key is missing, it falls back to English
- If English is also missing, it returns the key itself
- This prevents blank UI elements

## Current Implementation Status

✅ Infrastructure complete
✅ Translation context provider
✅ Language switcher component
✅ Footer integration
✅ English translations (200+ keys)
✅ Spanish translations (200+ keys)
⏳ German, Portuguese, Italian, French, Polish, Simplified Chinese (using English fallback)
⏳ Component migration (to be done)

## Next Steps

To fully implement i18n across the app:

1. Update each component to use `useTranslation()` hook
2. Replace hard-coded strings with translation keys
3. Complete translations for remaining 6 languages
4. Test language switching on all pages
5. Verify layout with different text lengths (some languages are longer)

## Notes

- All client components can use the hook
- Server components need special handling (not yet implemented)
- Page reloads on language change ensures consistency
- Translation keys are type-safe (TypeScript will catch missing keys)
