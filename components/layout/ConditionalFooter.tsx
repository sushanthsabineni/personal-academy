'use client'

// Next.js
import { usePathname } from 'next/navigation'

// Internal components
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Show footer on landing page and dashboard, hide on other pages after login
  const showFooter = pathname === '/' || pathname === '/dashboard'
  
  if (!showFooter) {
    return null
  }
  
  return <Footer />
}
