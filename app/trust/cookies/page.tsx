// Next.js
import Link from 'next/link';

// External libraries
import { Cookie, ChevronRight, Home, Shield, BarChart, Megaphone } from '@/lib/icons';

// Internal utilities
import { COOKIE_POLICY, COMPANY_INFO, formatDate, getContactEmail } from '@/lib/legalContent';

export default function CookiePreferencesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/trust" className="hover:text-blue-600">
              Trust Center
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Cookie Preferences</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Cookie className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
              <p className="text-purple-100">
                Last Updated: {formatDate(COMPANY_INFO.lastUpdated)}
              </p>
            </div>
          </div>
          <p className="text-lg text-purple-50 max-w-3xl">
            Learn about how we use cookies and similar technologies to enhance your experience 
            on Personal Academy.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to 
              website owners.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies (such as local storage) to enhance your browsing 
              experience, analyze site traffic, and serve personalized content.
            </p>
          </div>
        </section>

        {/* Cookie Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>

          {/* Essential Cookies */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-bold">Essential Cookies</h3>
                    <p className="text-sm text-green-50">Always Active - Required for website functionality</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  These cookies are necessary for the website to function properly. They enable core 
                  functionality such as security, network management, and accessibility. You cannot 
                  opt-out of these cookies.
                </p>
                <div className="space-y-3">
                  {COOKIE_POLICY.essential.map((cookie, index) => (
                    <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h4 className="font-semibold text-gray-900 mb-2">{cookie.name}</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Purpose:</span>
                          <p className="text-gray-800">{cookie.purpose}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="text-gray-800">{cookie.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <BarChart className="w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-bold">Analytics Cookies</h3>
                    <p className="text-sm text-blue-50">Optional - Help us improve our services</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously. This data helps us improve our services and 
                  user experience.
                </p>
                <div className="space-y-3">
                  {COOKIE_POLICY.analytics.map((cookie, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2">{cookie.name}</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm mb-2">
                        <div>
                          <span className="text-gray-600">Purpose:</span>
                          <p className="text-gray-800">{cookie.purpose}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="text-gray-800">{cookie.duration}</p>
                        </div>
                      </div>
                      {cookie.optOut && (
                        <div className="mt-3 p-3 bg-blue-100 rounded">
                          <p className="text-xs text-blue-900">
                            <strong>Opt-out available:</strong>{' '}
                            <a 
                              href={cookie.optOut} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="underline hover:text-blue-700"
                            >
                              Click here to opt-out
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-6 h-6" />
                  <div>
                    <h3 className="text-xl font-bold">Marketing Cookies</h3>
                    <p className="text-sm text-purple-50">Optional - Personalized advertising and campaigns</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  These cookies are used to track visitors across websites to display relevant 
                  advertisements and measure campaign effectiveness. They also help us understand 
                  which marketing channels are most effective.
                </p>
                <div className="space-y-3">
                  {COOKIE_POLICY.marketing.map((cookie, index) => (
                    <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <h4 className="font-semibold text-gray-900 mb-2">{cookie.name}</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Purpose:</span>
                          <p className="text-gray-800">{cookie.purpose}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="text-gray-800">{cookie.duration}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Through Our Cookie Banner</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                When you first visit our website, you&apos;ll see a cookie consent banner. You can:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span><strong>Accept All:</strong> Allow all cookies for the best experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span><strong>Essential Only:</strong> Only use necessary cookies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span><strong>Customize:</strong> Choose which categories of cookies to allow</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Through Your Browser Settings</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                You can also control cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>View and delete cookies stored on your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Block all or specific cookies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Delete cookies when you close your browser</span>
                </li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                Note: Blocking or deleting essential cookies may affect website functionality.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Browser Cookie Settings</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Chrome:</strong> Settings → Privacy and security → Cookies</p>
                <p>• <strong>Firefox:</strong> Settings → Privacy & Security → Cookies</p>
                <p>• <strong>Safari:</strong> Preferences → Privacy → Cookies</p>
                <p>• <strong>Edge:</strong> Settings → Privacy → Cookies</p>
              </div>
            </div>
          </div>
        </section>

        {/* Third-Party Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              In addition to our own cookies, we may use third-party cookies from trusted partners 
              to help us improve our services:
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Helps us understand how visitors use our website and improve user experience.
                </p>
                <a 
                  href="https://tools.google.com/dlpage/gaoptout" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Opt-out of Google Analytics →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Updates to Cookie Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or applicable laws. We will notify you of any material changes by:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Updating the &quot;Last Updated&quot; date at the top of this page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Displaying a notice on our website</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Sending you an email notification (for significant changes)</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Contact Us */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Privacy Inquiries</h4>
                <a 
                  href={`mailto:${getContactEmail('legal')}`}
                  className="text-purple-600 hover:underline text-sm"
                >
                  {getContactEmail('legal')}
                </a>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">General Support</h4>
                <a 
                  href={`mailto:${getContactEmail('support')}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {getContactEmail('support')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Information</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/trust/privacy"
              className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-sm text-gray-600">
                Learn how we collect and use your personal data
              </p>
            </Link>
            <Link 
              href="/trust/gdpr"
              className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-2">GDPR Compliance</h3>
              <p className="text-sm text-gray-600">
                Your data protection rights under GDPR
              </p>
            </Link>
            <Link 
              href="/trust"
              className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Trust Center</h3>
              <p className="text-sm text-gray-600">
                Security and compliance information
              </p>
            </Link>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t">
          <Link 
            href="/trust/privacy"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Privacy Policy</span>
          </Link>

          <Link 
            href="/trust"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <Home className="w-4 h-4" />
            <span>Back to Trust Center</span>
          </Link>

          <Link 
            href="/trust/gdpr"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>GDPR Compliance</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>Last Updated: {formatDate(COMPANY_INFO.lastUpdated)}</p>
          <p className="mt-2">© {new Date().getFullYear()} {COMPANY_INFO.legalName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
