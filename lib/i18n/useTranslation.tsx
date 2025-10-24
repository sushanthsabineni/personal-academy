'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { LanguageCode, getCurrentLanguage, setCurrentLanguage as saveLanguage } from './config'
import { translations } from './translations/index'

interface I18nContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLanguage = getCurrentLanguage()
    if (savedLanguage !== language) {
      setLanguageState(savedLanguage)
    }
    setMounted(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    saveLanguage(lang)
    // Reload page to apply translations
    window.location.reload()
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // Fallback to English
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = translations.en as any
        for (const fallbackKey of keys) {
          value = value?.[fallbackKey]
        }
        break
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider')
  }
  return context
}
