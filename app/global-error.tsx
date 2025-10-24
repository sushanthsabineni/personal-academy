'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log critical error to monitoring service
    console.error('CRITICAL ERROR:', error)
    
    // Track critical error with Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `CRITICAL: ${error.message}`,
        fatal: true,
        error_digest: error.digest,
      })
    }
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ maxWidth: '500px', width: '100%' }}>
            {/* Error Icon */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle
                  size={40}
                  color="#f87171"
                  style={{ display: 'block' }}
                />
              </div>
            </div>

            {/* Error Message */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '15px',
                }}
              >
                Critical Error
              </h1>
              <p
                style={{
                  fontSize: '18px',
                  color: '#9ca3af',
                  marginBottom: '20px',
                  lineHeight: '1.6',
                }}
              >
                A critical error occurred that prevented the application from loading.
                Please try refreshing the page.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <div
                  style={{
                    marginTop: '30px',
                    padding: '20px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 1)',
                    borderRadius: '8px',
                    textAlign: 'left',
                  }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: '#f87171',
                      marginBottom: '10px',
                      wordBreak: 'break-word',
                    }}
                  >
                    <strong>Error:</strong> {error.message}
                  </p>
                  {error.digest && (
                    <p
                      style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: '#6b7280',
                        wordBreak: 'break-word',
                      }}
                    >
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <details style={{ marginTop: '15px' }}>
                      <summary
                        style={{
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#9ca3af',
                          marginBottom: '10px',
                        }}
                      >
                        View Stack Trace
                      </summary>
                      <pre
                        style={{
                          fontSize: '10px',
                          color: '#6b7280',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflow: 'auto',
                          maxHeight: '200px',
                        }}
                      >
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={reset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '15px 30px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#6d28d9'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#7c3aed'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <RefreshCw size={16} style={{ display: 'block' }} />
                Reload Application
              </button>
            </div>

            {/* Help Text */}
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                If the problem continues, please clear your browser cache and cookies,
                or{' '}
                <a
                  href="mailto:support@personalacademy.com"
                  style={{
                    color: '#a78bfa',
                    textDecoration: 'underline',
                  }}
                >
                  contact our support team
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
