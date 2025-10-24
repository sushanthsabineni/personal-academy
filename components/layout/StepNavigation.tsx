'use client'

// Next.js
import { useRouter } from 'next/navigation'

// External libraries
import { ChevronLeft, ChevronRight } from '@/lib/icons'

interface StepNavigationProps {
  currentStep: number
  onNext?: () => void
  onPrevious?: () => void
  isValid?: boolean
}

export function StepNavigation({ 
  currentStep, 
  onNext, 
  onPrevious,
  isValid = true 
}: StepNavigationProps) {
  const router = useRouter()

  const stepMap: Record<number, string> = {
    1: 'essentials',
    2: 'multimedia',
    3: 'modules',
    4: 'storyboard'
  }

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious()
    } else if (currentStep > 1) {
      router.push(`/create/${stepMap[currentStep - 1]}`)
    }
  }

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else if (currentStep < 4) {
      router.push(`/create/${stepMap[currentStep + 1]}`)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t border-gray-200 dark:border-slate-700">
      <button
        onClick={handlePrevious}
        disabled={currentStep === 1}
        className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
      >
        <ChevronLeft size={20} />
        Previous
      </button>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Step {currentStep} of 4
      </div>

      <button
        onClick={handleNext}
        disabled={currentStep === 4 || !isValid}
        className="flex items-center gap-2 px-6 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md"
      >
        Next
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
