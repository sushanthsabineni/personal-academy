'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin } from '@/lib/adminAuth'
import { Shield, Lock, Mail, AlertCircle } from '@/lib/icons'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      const success = adminLogin(email, password)
      
      if (success) {
        router.push('/admin/dashboard')
      } else {
        setError('Invalid admin credentials')
        setIsLoading(false)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md">
        {/* Admin Login Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
          
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            Admin Portal
          </h1>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
            Sign in to access the admin dashboard
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@personalacademy.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Demo Credentials:</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Email: admin@personalacademy.com</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Password: admin123</p>
          </div>

          {/* Security Notice */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
            This is a secure admin area. All actions are logged.
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
