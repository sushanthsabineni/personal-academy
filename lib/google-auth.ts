// Google OAuth utilities
// This provides a simple Google Sign-In implementation

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void
          renderButton: (parent: HTMLElement, options: GoogleButtonConfig) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleInitConfig {
  client_id: string
  callback: (response: GoogleCallbackResponse) => void
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  type?: 'standard' | 'icon'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: string
}

interface GoogleCallbackResponse {
  credential: string
  select_by?: string
}

export interface GoogleUserInfo {
  name: string
  email: string
  picture: string
  sub: string
  given_name?: string
  family_name?: string
}

// For development/demo, use this placeholder client ID
// In production, replace with your actual Google OAuth client ID from Google Cloud Console
export const GOOGLE_CLIENT_ID = '1086994901085-9g1tr8ldp3l0hfqnhvcub5t7egkf3gfr.apps.googleusercontent.com'

export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script'))
    document.head.appendChild(script)
  })
}

export const decodeJWT = (token: string): GoogleUserInfo | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

export const initializeGoogleSignIn = (
  onSuccess: (userInfo: GoogleUserInfo) => void,
  onError?: (error: Error) => void
) => {
  loadGoogleScript()
    .then(() => {
      if (!window.google) {
        throw new Error('Google Sign-In not loaded')
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: GoogleCallbackResponse) => {
          const userInfo = decodeJWT(response.credential)
          if (userInfo) {
            onSuccess(userInfo)
          } else {
            onError?.(new Error('Failed to decode user information'))
          }
        },
      })
    })
    .catch((error) => {
      console.error('Google Sign-In initialization failed:', error)
      onError?.(error)
    })
}

export const renderGoogleButton = (
  elementId: string,
  options?: GoogleButtonConfig
) => {
  const element = document.getElementById(elementId)
  if (!element || !window.google) {
    console.log('Element or Google not found:', { element: !!element, google: !!window.google })
    return
  }

  const width = element.offsetWidth ? element.offsetWidth.toString() : '350'

  window.google.accounts.id.renderButton(element, {
    theme: 'outline',
    size: 'large',
    type: 'standard',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: width,
    ...options,
  })
  console.log('Google button rendered')
}
