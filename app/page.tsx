'use client'

// React
import { useEffect, useState } from 'react'

// Next.js
import { useRouter } from 'next/navigation'

// Components
import ContactForm from '@/components/ContactForm'

// External libraries
import { Zap, Target, Rocket, Mail } from '@/lib/icons'

// Internal utilities
import { isAuthenticated } from '@/lib/auth'

export default function LandingPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      
      {/* HERO SECTION */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Create Engaging Courses in Minutes with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            Personal Academy helps instructional designers build professional, engaging courses faster than ever before. Powered by AI, loved by educators.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-3 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
                >
                  Get Started
                </button>
                <button
                  onClick={() => router.push('/help')}
                  className="px-8 py-3 border-2 border-brand-teal text-brand-teal dark:text-brand-teal font-semibold rounded-lg hover:bg-brand-teal/10 transition-all"
                >
                  Learn More
                </button>
              </>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            No credit card required • Free 1,000 credits on signup
          </p>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Personal Academy?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Everything you need to create world-class courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md hover:shadow-lg hover:scale-105 transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                  <Zap size={32} className="text-brand-teal" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-700 dark:text-gray-400">
                Generate complete course structures in seconds using advanced AI algorithms
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md hover:shadow-lg hover:scale-105 transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                  <Target size={32} className="text-brand-teal" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Purpose-Built
              </h3>
              <p className="text-gray-700 dark:text-gray-400">
                Designed specifically for instructional designers and L&D professionals
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-md hover:shadow-lg hover:scale-105 transition-all">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                  <Rocket size={32} className="text-brand-teal" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Launch
              </h3>
              <p className="text-gray-700 dark:text-gray-400">
                Export to SCORM, xAPI, PDF, PowerPoint, and Word formats instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-12 px-6 bg-gradient-to-r from-brand-teal to-brand-cyan">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Course Creation?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join educators worldwide who are creating better courses, faster.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3 bg-white hover:bg-gray-100 text-brand-dark font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Floating Contact Button */}
      <button
        onClick={() => setIsContactFormOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-teal hover:bg-brand-cyan text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center z-40 group"
        aria-label="Contact Support"
      >
        <Mail size={24} />
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Contact Us
        </span>
      </button>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={isContactFormOpen} 
        onClose={() => setIsContactFormOpen(false)} 
      />
    </div>
  )
}
