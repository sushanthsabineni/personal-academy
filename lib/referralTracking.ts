/**
 * Referral Code Utilities
 * Helpers for tracking and managing referral codes during signup
 */

const REFERRAL_STORAGE_KEY = 'pending_referral_code'
const REFERRAL_EXPIRY_DAYS = 30

/**
 * Store referral code from URL parameter
 * Call this on landing/signup page load when ?ref= parameter is present
 */
export function storeReferralCode(code: string): void {
  if (typeof window === 'undefined') return
  
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS)
  
  const referralData = {
    code: code.toUpperCase(),
    storedAt: new Date().toISOString(),
    expiresAt: expiryDate.toISOString(),
  }
  
  localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referralData))
  console.info('Referral code stored:', code)
}

/**
 * Get stored referral code (if not expired)
 * Returns null if no code or expired
 */
export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY)
    if (!stored) return null
    
    const data = JSON.parse(stored)
    const expiryDate = new Date(data.expiresAt)
    
    if (new Date() > expiryDate) {
      clearReferralCode()
      return null
    }
    
    return data.code
  } catch (error) {
    console.error('Error reading referral code:', error)
    return null
  }
}

/**
 * Clear stored referral code
 * Call this after successfully linking referee to referrer
 */
export function clearReferralCode(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(REFERRAL_STORAGE_KEY)
}

/**
 * Extract referral code from URL
 * Checks both ?ref= and ?referral= parameters
 */
export function extractReferralFromURL(): string | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  const refCode = urlParams.get('ref') || urlParams.get('referral')
  
  return refCode ? refCode.toUpperCase() : null
}

/**
 * Validate and store referral code from URL
 * Returns true if valid code found and stored
 */
export async function processReferralFromURL(): Promise<boolean> {
  const code = extractReferralFromURL()
  if (!code) return false
  
  try {
    // Validate code exists via API
    const response = await fetch('/api/referral/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.valid) {
        storeReferralCode(code)
        return true
      }
    }
  } catch (error) {
    console.error('Error validating referral code:', error)
  }
  
  return false
}

/**
 * Apply stored referral code after user signup
 * Call this after successful authentication
 */
export async function applyStoredReferralCode(): Promise<boolean> {
  const code = getStoredReferralCode()
  if (!code) return false
  
  try {
    const response = await fetch('/api/referral/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: code }),
    })
    
    if (response.ok) {
      clearReferralCode()
      console.info('Referral link successfully applied')
      return true
    } else {
      const error = await response.json()
      console.error('Failed to apply referral:', error)
    }
  } catch (error) {
    console.error('Error applying referral code:', error)
  }
  
  return false
}
