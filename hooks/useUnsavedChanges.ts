'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [nextPath, setNextPath] = useState<string | null>(null)

  useEffect(() => {
    // Warn before page reload/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const confirmNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      setNextPath(path)
      setShowWarning(true)
      return false
    }
    return true
  }

  const handleConfirmLeave = () => {
    setShowWarning(false)
    if (nextPath) {
      router.push(nextPath)
    }
  }

  const handleCancelLeave = () => {
    setShowWarning(false)
    setNextPath(null)
  }

  return {
    showWarning,
    confirmNavigation,
    handleConfirmLeave,
    handleCancelLeave
  }
}
