'use client'

import { useRouter } from 'next/navigation'
import { Rocket, ArrowLeft, Clock, Bell } from 'lucide-react'

export default function ComingSoonPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-teal dark:hover:text-brand-teal transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Go Back</span>
        </button>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-12 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Rocket size={48} className="text-white" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Coming Soon! 🚀
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            We&apos;re working hard to bring you this exciting new feature. Stay tuned for updates!
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <Clock className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">In Development</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our team is actively building this feature
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                <Bell className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Get Notified</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We&apos;ll announce when it&apos;s ready
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <Rocket className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Launch Soon</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expected in upcoming releases
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="px-8 py-3 bg-brand-teal hover:bg-brand-cyan text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Continue Working
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-all"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Want to be notified when this feature launches?{' '}
              <a href="mailto:personalacademy1@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Contact us
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Thank you for your patience and support! 💙
        </p>
      </div>
    </div>
  )
}
