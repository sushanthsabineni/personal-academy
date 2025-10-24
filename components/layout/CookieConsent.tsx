'use client';

// React
import { useState, useEffect, useCallback } from 'react';

// Next.js
import Link from 'next/link';

// External libraries
import { Cookie, X, Settings, Shield } from '@/lib/icons';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const COOKIE_CONSENT_KEY = 'personal-academy-cookie-consent';

const getInitialPreferences = (): CookiePreferences => {
  if (typeof window === 'undefined') {
    return {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
  }

  const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (savedConsent) {
    try {
      return JSON.parse(savedConsent);
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    }
  }

  return {
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString()
  };
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(getInitialPreferences);

  const enableAnalytics = () => {
    // Initialize Google Analytics or other analytics tools
    if (typeof window !== 'undefined') {
      // Example: window.gtag('consent', 'update', { analytics_storage: 'granted' });
      // Analytics tracking enabled
    }
  };

  const disableAnalytics = () => {
    // Disable analytics
    if (typeof window !== 'undefined') {
      // Example: window.gtag('consent', 'update', { analytics_storage: 'denied' });
      // Analytics tracking disabled
    }
  };

  const enableMarketing = () => {
    // Enable marketing cookies
    if (typeof window !== 'undefined') {
      // Marketing cookies enabled
    }
  };

  const disableMarketing = () => {
    // Disable marketing cookies
    if (typeof window !== 'undefined') {
      // Marketing cookies disabled
    }
  };

  const applyPreferences = useCallback((prefs: CookiePreferences) => {
    // Apply analytics cookies
    if (prefs.analytics) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }

    // Apply marketing cookies
    if (prefs.marketing) {
      enableMarketing();
    } else {
      disableMarketing();
    }
  }, []);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (!savedConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Apply saved preferences without setting state again
      const saved = getInitialPreferences();
      applyPreferences(saved);
    }
  }, [applyPreferences]);

  const savePreferences = (prefs: CookiePreferences) => {
    const prefsWithTimestamp = {
      ...prefs,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefsWithTimestamp));
    setPreferences(prefsWithTimestamp);
    applyPreferences(prefsWithTimestamp);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    });
  };

  const handleAcceptEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  const handleToggle = (category: 'analytics' | 'marketing') => {
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Settings Panel */}
          {showSettings ? (
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Cookie Preferences</h3>
                    <p className="text-sm text-gray-600">Customize your cookie settings</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential Cookies */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-gray-900">Essential Cookies</h4>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Always Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Required for the website to function properly. These cookies enable core 
                        functionality such as security, authentication, and session management.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Cookie className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Optional
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Help us understand how visitors interact with our website by collecting 
                        and reporting information anonymously. This helps us improve our services.
                      </p>
                      <p className="text-xs text-gray-500">
                        Tools: Google Analytics
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleToggle('analytics')}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                          preferences.analytics 
                            ? 'bg-blue-600 justify-end' 
                            : 'bg-gray-300 justify-start'
                        } px-1`}
                        aria-label="Toggle analytics cookies"
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Cookie className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          Optional
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Used to track visitors across websites to display relevant advertisements 
                        and measure campaign effectiveness.
                      </p>
                      <p className="text-xs text-gray-500">
                        Tools: Referral tracking, Campaign analytics
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleToggle('marketing')}
                        className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                          preferences.marketing 
                            ? 'bg-purple-600 justify-end' 
                            : 'bg-gray-300 justify-start'
                        } px-1`}
                        aria-label="Toggle marketing cookies"
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept All
                </button>
              </div>

              <div className="mt-4 text-center">
                <Link 
                  href="/trust/privacy" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Read our Privacy Policy
                </Link>
              </div>
            </div>
          ) : (
            // Simple Banner
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                    <Cookie className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We use cookies to enhance your browsing experience, serve personalized content, 
                      and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
                      You can customize your preferences or accept only essential cookies.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <Link 
                        href="/trust/privacy" 
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Privacy Policy
                      </Link>
                      <span className="text-gray-400">•</span>
                      <Link 
                        href="/trust/privacy#cookies" 
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Cookie Policy
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Customize
                  </button>
                  <button
                    onClick={handleAcceptEssential}
                    className="px-6 py-2.5 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
