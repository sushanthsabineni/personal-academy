// Server Component
import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import ContactTrigger from '@/components/ContactTrigger'

// External libraries
import { Zap, Target, Rocket, Mail } from '@/lib/icons'

export default async function LandingPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session?.user

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      
      {/* HERO SECTION */}
      <section className="py-4 md:py-6 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <Image 
              src="/logo.webp"
              alt="Personal Academy"
              width={612}
              height={612}
              priority
              className="w-[612px] h-auto object-contain"
              style={{ height: 'auto' }}
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Create Engaging Courses in Minutes with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            Personal Academy built by L&D professionals to help L&D professionals build engaging courses faster than ever before. Powered by AI, loved by educators.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-8 py-3 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-8 py-3 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105">
                  Get Started
                </Link>
                <Link href="/faq" className="px-8 py-3 border-2 border-brand-teal text-brand-teal dark:text-brand-teal font-semibold rounded-lg hover:bg-brand-teal/10 transition-all">
                  Learn More
                </Link>
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
                Export to PDF, PowerPoint, and Word formats instantly
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
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-white hover:bg-gray-100 text-brand-dark font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Contact client island */}
      <ContactTrigger />
    </div>
  )
}
