// Next.js
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'

// Internal components
import { Header } from '@/components/layout/Header'
import ConditionalFooter from '@/components/layout/ConditionalFooter'
import CookieConsent from '@/components/layout/CookieConsent'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { RouteGuard } from '@/components/layout/RouteGuard'
import RazorpayScript from '@/components/RazorpayScript'

// Internal utilities
import { I18nProvider } from '@/lib/i18n/useTranslation'

// Styles
import './globals.css'

// Modern, clean font for body text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Bold, modern font for headings
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

// Enhanced SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://personalacademy.com'), // Update with your domain
  title: {
    default: 'Personal Academy - Create Engaging Learning Content with AI',
    template: '%s | Personal Academy',
  },
  description:
    'Transform your expertise into professional e-learning courses with AI-powered course creation tools. Build interactive modules, lessons, and assessments in minutes.',
  keywords: [
    'e-learning platform',
    'course creation',
    'AI course builder',
    'online education',
    'learning management',
    'instructional design',
    'course authoring',
    'educational content',
    'training materials',
    'storyboard creator',
  ],
  authors: [{ name: 'Personal Academy Team' }],
  creator: 'Personal Academy',
  publisher: 'Personal Academy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_ES'],
    url: 'https://personalacademy.com',
    siteName: 'Personal Academy',
    title: 'Personal Academy - Create Engaging Learning Content with AI',
    description:
      'Transform your expertise into professional e-learning courses with AI-powered course creation tools. Build interactive modules, lessons, and assessments in minutes.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Personal Academy - AI-Powered Course Creation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personal Academy - Create Engaging Learning Content with AI',
    description:
      'Transform your expertise into professional e-learning courses with AI-powered course creation tools.',
    images: ['/twitter-image.png'],
    creator: '@personalacademy', // Update with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: 'https://personalacademy.com',
    languages: {
      'en-US': 'https://personalacademy.com',
      'es-ES': 'https://personalacademy.com/es',
    },
  },
  category: 'education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const isDark = theme ? theme === 'dark' : true;
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <I18nProvider>
            <RouteGuard>
              <Header />
              <main className="pt-16">
                {children}
              </main>
              <ConditionalFooter />
              <CookieConsent />
            </RouteGuard>
          </I18nProvider>
        </ThemeProvider>
        {/* Google Analytics - Replace G-XXXXXXXXXX with your Measurement ID */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {/* Razorpay Payment Gateway Script */}
        <RazorpayScript />
      </body>
    </html>
  )
}
