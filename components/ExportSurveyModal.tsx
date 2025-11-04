'use client'

import { useState } from 'react'
import { X, CheckCircle } from '@/lib/icons'

interface ExportSurveyModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  userEmail?: string
}

export default function ExportSurveyModal({
  isOpen,
  onClose,
  onComplete,
  userEmail = '',
}: ExportSurveyModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const questions = [
    {
      id: 'purpose',
      question: 'What will you use this course for?',
      type: 'single',
      options: [
        'Corporate Training',
        'Academic/Educational Institution',
        'Personal Development',
        'Client Project',
        'Side Business/Freelancing',
        'Other'
      ]
    },
    {
      id: 'industry',
      question: 'Which industry are you in?',
      type: 'single',
      options: [
        'Technology/IT',
        'Healthcare',
        'Education',
        'Finance/Banking',
        'Manufacturing',
        'Retail/E-commerce',
        'Consulting',
        'Other'
      ]
    },
    {
      id: 'team_size',
      question: 'How many people are in your team/organization?',
      type: 'single',
      options: [
        'Just me (Solo)',
        '2-10 people',
        '11-50 people',
        '51-200 people',
        '201-1000 people',
        '1000+ people'
      ]
    },
    {
      id: 'found_us',
      question: 'How did you find us?',
      type: 'single',
      options: [
        'Google Search',
        'Social Media (LinkedIn, Twitter, etc.)',
        'Word of Mouth/Referral',
        'YouTube',
        'Blog/Article',
        'Advertisement',
        'Other'
      ]
    },
    {
      id: 'feature_request',
      question: 'What feature would you like to see next?',
      type: 'text',
      placeholder: 'Share your ideas...'
    }
  ]

  if (!isOpen) return null

  const currentQ = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1
  const hasAnswer = answers[currentQ.id] && answers[currentQ.id].trim() !== ''

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQ.id]: answer })
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSkip = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Submit survey responses to API
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          survey_type: 'first_export',
          responses: answers,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        console.error('Failed to submit survey')
      }

      // Mark survey as completed in profile
      await fetch('/api/profile/survey-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          survey_type: 'first_export_survey_completed',
        }),
      })
    } catch (error) {
      console.error('Error submitting survey:', error)
    } finally {
      setIsSubmitting(false)
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl border-2 border-brand-teal/30 dark:border-brand-teal/50 max-h-[90vh] overflow-y-auto z-10">
        
        {/* Close Button - Only show if not submitting */}
        {!isSubmitting && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
              <CheckCircle className="text-brand-teal" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quick Survey
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Help us improve! Answer a few quick questions (less than 2 minutes)
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-teal transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentQ.question}
          </h3>

          {currentQ.type === 'single' && currentQ.options && (
            <div className="space-y-2">
              {currentQ.options.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    answers[currentQ.id] === option
                      ? 'border-brand-teal bg-brand-teal/5'
                      : 'border-gray-300 dark:border-gray-600 hover:border-brand-teal/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQ.id}
                    value={option}
                    checked={answers[currentQ.id] === option}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="w-5 h-5 accent-brand-teal"
                  />
                  <span className="text-gray-700 dark:text-gray-200">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          )}

          {currentQ.type === 'text' && (
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={currentQ.placeholder}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none resize-none"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {currentQuestion > 0 && (
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all disabled:opacity-50"
            >
              Skip
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={!hasAnswer || isSubmitting}
            className="px-6 py-2 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                {isLastQuestion ? 'Submit' : 'Next'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
