'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from '@/lib/icons'

export default function PAdminPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/admin/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <p className="text-white text-lg font-medium">Redirecting to Admin Portal...</p>
      </div>
    </div>
  )
}
