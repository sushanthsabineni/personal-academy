'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Get saved theme or default to dark mode
    const savedTheme = localStorage.getItem('theme')
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : true // Default to dark

    // Apply theme immediately
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return <>{children}</>
}
