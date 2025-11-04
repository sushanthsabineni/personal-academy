'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { supabase } from '@/lib/supabase/client'
import { trackLogin, trackSignUp } from '@/lib/analytics'
import { 
  processReferralFromURL, 
  applyStoredReferralCode, 
  getStoredReferralCode 
} from '@/lib/referralTracking'
import { Eye, EyeOff } from '@/lib/icons'

export default function AuthPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Process referral code from URL on page load
  useEffect(() => {
    processReferralFromURL().then((hasReferral) => {
      if (hasReferral) {
        const code = getStoredReferralCode()
        setReferralCode(code)
        setIsSignUp(true) // Switch to sign up mode if referral code present
      }
    })
  }, [])

  const ensureProfile = async (
    userId: string,
    emailAddress: string,
    fullName?: string,
    provider?: string,
    avatarUrl?: string,
  ) => {
    try {
      const response = await fetch('/api/auth/ensure-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: emailAddress,
          fullName,
          authProvider: provider,
          avatarUrl,
        }),
      })

      if (!response.ok) {
        const details = await response.json().catch(() => null)
        console.warn('ensure-profile failed', response.status, details?.error)
      }
    } catch (profileError) {
      console.warn('ensure-profile request failed', profileError)
    }
  }

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      if (!data.user || !data.session) {
        throw new Error('No session created')
      }

      await ensureProfile(
        data.user.id,
        data.user.email ?? email,
        data.user.user_metadata?.full_name,
        data.user.app_metadata?.provider as string | undefined,
        data.user.user_metadata?.avatar_url,
      )

      trackLogin('email')
      setSuccessMessage('Sign in successful! Redirecting...')

      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get('redirect') || '/dashboard'

      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.href = redirectTo
    } catch (signInError) {
      console.error('Sign in error:', signInError)
      const message = signInError instanceof Error ? signInError.message : 'Failed to sign in. Please try again.'

      if (message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (message.includes('Email not confirmed')) {
        setError('Please confirm your email before signing in.')
      } else {
        setError(message)
      }

      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    if (!firstName.trim()) {
      setError('Please enter your first name')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms to continue')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.user && !data.session) {
        setSuccessMessage('Success! Please check your email to confirm your account.')
        setIsLoading(false)
        return
      }

      if (data.user && data.session) {
        await new Promise(resolve => setTimeout(resolve, 500))

        await ensureProfile(
          data.user.id,
          data.user.email ?? email,
          fullName,
          'email',
          data.user.user_metadata?.avatar_url,
        )

        // Apply referral code if stored
        await applyStoredReferralCode().catch(err => {
          console.error('Failed to apply referral code:', err)
          // Don't block signup if referral fails
        })

        trackSignUp('email')
        setSuccessMessage('Account created! Redirecting...')

        await new Promise(resolve => setTimeout(resolve, 1000))
        window.location.href = '/dashboard'
        return
      }

      setSuccessMessage('Account created! Please try signing in.')
      setIsLoading(false)
    } catch (signUpError) {
      console.error('Sign up error:', signUpError)
      setError(signUpError instanceof Error ? signUpError.message : 'Failed to create account. Please try again.')
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (googleError: unknown) {
      console.error('Google sign in error:', googleError)
      setError(googleError instanceof Error ? googleError.message : 'Failed to sign in with Google')
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setSuccessMessage('')
    setAgreedToTerms(false)
    setShowPassword(false)
  }

  const heading = isSignUp ? 'Create your Personal Academy account' : 'Welcome to Personal Academy'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-5 border border-gray-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">{heading}</h1>

          {referralCode && isSignUp && (
            <div className="mb-3 rounded-lg border border-brand-teal/30 bg-brand-teal/10 px-3 py-2 text-sm text-brand-teal dark:border-brand-teal/40 dark:bg-brand-teal/20">
              🎉 Referral code <strong>{referralCode}</strong> will be applied! You&apos;ll get 20% bonus on your first purchase.
            </div>
          )}

          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300" role="alert">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300" role="status">
              {successMessage}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mb-3 flex items-center justify-center gap-2 h-9 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Continue with Google</span>
          </button>

          <div className="flex flex-col items-center gap-2 my-3">
            <div className="w-full h-px bg-gray-200 dark:bg-slate-700" />
            <span className="text-xs text-gray-500 dark:text-gray-400">OR</span>
            <div className="w-full h-px bg-gray-200 dark:bg-slate-700" />
          </div>

          {isSignUp && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full h-9 px-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full h-9 px-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-9 px-3 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full h-9 px-3 pr-10 rounded-lg border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none transition-all"
                disabled={isLoading}
                onKeyDown={(e) => {
                  const canSubmit = isSignUp ? agreedToTerms : true
                  if (e.key === 'Enter' && !isLoading && canSubmit) {
                    if (isSignUp) {
                      handleSignUp()
                    } else {
                      handleSignIn()
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading || !password}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="mb-3">
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-brand-teal focus:ring-brand-teal focus:ring-2 cursor-pointer"
                  disabled={isLoading}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/trust/terms-of-service" className="text-brand-teal hover:underline font-medium">
                    Terms of Service
                  </Link>
                  {', '}
                  <Link href="/trust/terms-of-use" className="text-brand-teal hover:underline font-medium">
                    Terms of Use
                  </Link>
                  {', and '}
                  <Link href="/trust/privacy" className="text-brand-teal hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>
          )}

          {!isSignUp ? (
            <button
              onClick={handleSignIn}
              disabled={isLoading || !email || !password}
              className="w-full h-9 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          ) : (
            <button
              onClick={handleSignUp}
              disabled={isLoading || !agreedToTerms || !email || !password || !firstName.trim()}
              className="w-full h-9 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-3"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          )}

          <div className="text-center">
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className="text-sm text-brand-teal hover:underline font-medium disabled:opacity-50"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-brand-teal transition-colors text-sm"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
