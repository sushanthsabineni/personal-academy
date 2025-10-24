'use client'

// React
import { useState, useEffect } from 'react'

// External libraries
import { Check, Globe } from '@/lib/icons'

// Internal utilities
import { languages } from '@/lib/i18n/config'
import { useTranslation } from '@/lib/i18n/useTranslation'

export function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // This pattern is needed for proper client-side hydration
    // eslint-disable-next-line react-compiler/react-compiler
    setMounted(true)
  }, [])
  
  // Default values during SSR
  if (!mounted) {
    return (
      <div className="relative">
        <button
          disabled
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg opacity-50 cursor-not-allowed"
        >
          <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            🇬🇧 English
          </span>
        </button>
      </div>
    )
  }
  
  // Client-side only
  return <LanguageSwitcherClient />
}

function LanguageSwitcherClient() {
  const { language, setLanguage } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  
  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  lang.code === language
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </span>
                {lang.code === language && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
