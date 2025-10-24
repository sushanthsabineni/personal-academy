'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TermsOfServicePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/trust/terms-of-service')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  )
}
