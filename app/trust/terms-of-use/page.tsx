// Next.js
import Link from 'next/link';

// External libraries
import { FileText, ChevronRight, Home, AlertCircle, Users, Lock, Code, Gavel } from '@/lib/icons';

// Internal utilities
import { 
  COMPANY_INFO, 
  PROHIBITED_ACTIVITIES,
  getContactEmail,
  formatDate 
} from '@/lib/legalContent';

export default function TermsOfUsePage() {
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
            <span className="text-gray-900 font-medium">Terms of Use</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Terms of Use</h1>
              <p className="text-green-100">
                Last Updated: {formatDate(COMPANY_INFO.lastUpdated)}
              </p>
            </div>
          </div>
          <p className="text-lg text-green-50 max-w-3xl">
            Please read these Terms of Use carefully before using our website and services. 
            By accessing or using Personal Academy, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Important Notice</h3>
              <p className="text-yellow-800 text-sm leading-relaxed">
                These Terms of Use govern your access to and use of our website and platform. 
                For subscription terms, payment, credits, and service-specific agreements, 
                please refer to our <Link href="/trust/terms-of-service" className="underline font-medium">Terms of Service</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Acceptance of Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Gavel className="w-6 h-6 text-green-600" />
            1. Acceptance of Terms
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              By accessing or using the Personal Academy website (&quot;Platform&quot;), you acknowledge 
              that you have read, understood, and agree to be bound by these Terms of Use and our 
              Privacy Policy.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree to these terms, you must not access or use our Platform.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Agreement Hierarchy</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Terms of Use</strong> - Website access and conduct (this document)</li>
                <li>• <strong>Terms of Service</strong> - Subscription and service agreement</li>
                <li>• <strong>Privacy Policy</strong> - Data collection and usage</li>
                <li>• <strong>GDPR Compliance</strong> - EU data protection rights</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Eligibility */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            2. Eligibility and Account Registration
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2.1 Age Requirement</h3>
              <p className="text-gray-700 leading-relaxed">
                You must be at least 18 years old to use our Platform. By using Personal Academy, 
                you represent and warrant that you are at least 18 years of age. We do not knowingly 
                collect or solicit personal information from anyone under the age of 18.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2.2 Account Registration</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Provide accurate, current, and complete information during registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Maintain and promptly update your account information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Keep your password secure and confidential</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Notify us immediately of any unauthorized access to your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Accept responsibility for all activities under your account</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2.3 Account Termination</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your account if you violate these 
                Terms of Use or engage in fraudulent, abusive, or illegal activities.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Acceptable Use */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Code className="w-6 h-6 text-green-600" />
            3. Acceptable Use Policy
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              You agree to use our Platform only for lawful purposes and in accordance with these Terms of Use.
            </p>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">3.1 Prohibited Activities</h3>
              <p className="text-gray-700 mb-4">You may NOT use our Platform to:</p>
              
              <div className="grid gap-3">
                {PROHIBITED_ACTIVITIES.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-red-600 font-bold flex-shrink-0">✗</span>
                    <span className="text-gray-800">{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3.2 Enforcement</h3>
              <p className="text-gray-700 leading-relaxed">
                Violation of this Acceptable Use Policy may result in immediate account suspension, 
                termination of services without refund, legal action, and reporting to appropriate 
                law enforcement authorities.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Intellectual Property */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-green-600" />
            4. Intellectual Property Rights
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4.1 Our Content</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                The Platform and its entire contents, features, and functionality (including but not 
                limited to all information, software, text, displays, images, video, and audio, and 
                the design, selection, and arrangement thereof) are owned by Personal Academy APP, 
                its licensors, or other providers of such material and are protected by Indian and 
                international copyright, trademark, patent, trade secret, and other intellectual 
                property or proprietary rights laws.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>© {new Date().getFullYear()} Personal Academy APP.</strong> All rights reserved. 
                  Personal Academy™ and our logo are trademarks of Personal Academy APP.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4.2 Your Content</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                You retain ownership of any content you create, upload, or generate using our Platform 
                (&quot;Your Content&quot;). However, by using our AI-powered course generation services, 
                you grant us a limited license to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Process your inputs through our AI models to generate courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Store your content on our secure servers (Supabase India Region)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Display your generated courses back to you through our Platform</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-900">
                <strong>Important:</strong> We do NOT use your content to train our AI models. 
                We do NOT share your content with third parties for marketing purposes. 
                Your content remains private and is used solely to provide services to you.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4.3 AI-Generated Content</h3>
              <p className="text-gray-700 leading-relaxed">
                Courses and materials generated by our AI are provided to you under a non-exclusive, 
                non-transferable license. You may use AI-generated content for your personal or 
                commercial educational purposes, provided you comply with these Terms.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4.4 Restrictions</h3>
              <p className="text-gray-700 leading-relaxed mb-3">You may NOT:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span>Copy, reproduce, or redistribute our Platform&apos;s source code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span>Reverse engineer, decompile, or disassemble our software</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span>Remove, alter, or obscure any copyright, trademark, or proprietary notices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span>Use our Platform to create a competing service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">✗</span>
                  <span>Scrape, crawl, or use bots to extract data from our Platform</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. AI Disclaimer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            5. AI-Generated Content Disclaimer
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <p className="text-yellow-900 font-semibold mb-2">⚠️ Important Disclosure</p>
              <p className="text-yellow-800 text-sm leading-relaxed">
                Our Platform uses advanced artificial intelligence models to generate educational 
                content. While we strive for accuracy, AI-generated content may contain errors, 
                inaccuracies, or biases.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5.1 Content Review Required</h3>
              <p className="text-gray-700 leading-relaxed">
                You are solely responsible for reviewing, verifying, and validating all AI-generated 
                content before using it for any purpose. We strongly recommend that you:
              </p>
              <ul className="mt-3 space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Carefully review all generated course materials for accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Fact-check information against reliable sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Edit and customize content to suit your specific needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Consult subject matter experts for specialized or critical topics</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5.2 No Professional Advice</h3>
              <p className="text-gray-700 leading-relaxed">
                AI-generated content does not constitute professional advice (legal, medical, financial, 
                or otherwise). For professional guidance, please consult qualified professionals in 
                the relevant field.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5.3 Attribution</h3>
              <p className="text-gray-700 leading-relaxed">
                When publicly sharing or distributing AI-generated content from Personal Academy, 
                you should disclose that the content was generated using AI technology. This promotes 
                transparency and helps users make informed decisions about the content they consume.
              </p>
            </div>
          </div>
        </section>

        {/* 6. User Conduct */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. User Conduct and Responsibilities
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              As a user of Personal Academy, you agree to:
            </p>

            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <span className="text-green-600 font-bold text-xl flex-shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Accurate Information</h4>
                  <p className="text-sm text-gray-700">
                    Provide truthful and accurate information when registering and using our services
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <span className="text-green-600 font-bold text-xl flex-shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Lawful Use</h4>
                  <p className="text-sm text-gray-700">
                    Use the Platform only for lawful purposes and comply with all applicable laws
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <span className="text-green-600 font-bold text-xl flex-shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Respectful Interaction</h4>
                  <p className="text-sm text-gray-700">
                    Treat other users, our staff, and the Platform with respect
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <span className="text-green-600 font-bold text-xl flex-shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Security Compliance</h4>
                  <p className="text-sm text-gray-700">
                    Not attempt to bypass security measures or access unauthorized areas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                <span className="text-green-600 font-bold text-xl flex-shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Report Violations</h4>
                  <p className="text-sm text-gray-700">
                    Report any suspected violations of these Terms or security issues
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Privacy and Data Protection */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Privacy and Data Protection
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Our collection, use, and protection of your personal 
              information is governed by our <Link href="/trust/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>, 
              which is incorporated into these Terms of Use by reference.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">🇪🇺 GDPR Compliance</h4>
                <p className="text-sm text-blue-800">
                  EU users have specific rights under GDPR. View our{' '}
                  <Link href="/trust/gdpr" className="underline font-medium">GDPR Compliance</Link> page.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">🇮🇳 DPDP Act 2023</h4>
                <p className="text-sm text-green-800">
                  Indian users are protected under the Digital Personal Data Protection Act, 2023.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🇺🇸 CCPA Rights</h4>
                <p className="text-sm text-purple-800">
                  California residents have additional privacy rights under the CCPA.
                </p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">🔒 Data Security</h4>
                <p className="text-sm text-indigo-800">
                  Your data is encrypted and stored securely in Supabase&apos;s India Region servers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Modifications to Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            8. Modifications to These Terms
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify or update these Terms of Use at any time. When we make 
              changes, we will:
            </p>

            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">1.</span>
                <span>Update the &quot;Last Updated&quot; date at the top of this page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">2.</span>
                <span>Notify you via email if the changes are material</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">3.</span>
                <span>Provide a notice on our Platform for 30 days</span>
              </li>
            </ul>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
              <p className="text-sm text-yellow-900">
                <strong>Your Continued Use:</strong> By continuing to access or use our Platform after 
                revisions become effective, you agree to be bound by the revised terms. If you do not 
                agree to the new terms, you must stop using the Platform.
              </p>
            </div>
          </div>
        </section>

        {/* 9. Third-Party Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            9. Third-Party Links and Services
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Our Platform may contain links to third-party websites, services, or resources that are 
              not owned or controlled by Personal Academy APP.
            </p>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">9.1 No Endorsement</h3>
              <p className="text-gray-700 leading-relaxed">
                We do not endorse or assume any responsibility for any third-party sites, information, 
                materials, products, or services. Your use of third-party websites is at your own risk 
                and subject to the terms and conditions of those websites.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">9.2 Third-Party Services We Use</h3>
              <p className="text-gray-700 mb-3">Our Platform integrates with the following third-party services:</p>
              
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-600 font-bold">→</span>
                  <div>
                    <strong className="text-gray-900">OpenAI</strong>
                    <p className="text-sm text-gray-600">AI models for course generation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-600 font-bold">→</span>
                  <div>
                    <strong className="text-gray-900">Supabase</strong>
                    <p className="text-sm text-gray-600">Database and authentication (India Region)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-600 font-bold">→</span>
                  <div>
                    <strong className="text-gray-900">Razorpay</strong>
                    <p className="text-sm text-gray-600">Payment processing for Indian users</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-600 font-bold">→</span>
                  <div>
                    <strong className="text-gray-900">Stripe</strong>
                    <p className="text-sm text-gray-600">Payment processing for international users</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                Each service has its own terms and privacy policies. We encourage you to review them.
              </p>
            </div>
          </div>
        </section>

        {/* 10. Disclaimer of Warranties */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            10. Disclaimer of Warranties
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
              <p className="text-sm text-red-900 font-semibold uppercase tracking-wide mb-2">
                IMPORTANT LEGAL NOTICE
              </p>
              <p className="text-sm text-red-800 leading-relaxed">
                THE PLATFORM AND ALL CONTENT, SERVICES, AND FEATURES ARE PROVIDED ON AN &quot;AS IS&quot; 
                AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              To the fullest extent permitted by applicable law, Personal Academy APP disclaims all 
              warranties, express or implied, including but not limited to:
            </p>

            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Implied warranties of merchantability and fitness for a particular purpose</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Non-infringement of third-party rights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Accuracy, completeness, or reliability of AI-generated content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Uninterrupted, secure, or error-free operation of the Platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span>Freedom from viruses or other harmful components</span>
              </li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-4">
              We do not warrant that the Platform will meet your requirements or that any defects 
              will be corrected. Your use of the Platform is at your sole risk.
            </p>
          </div>
        </section>

        {/* 11. Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            11. Limitation of Liability
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
              <p className="text-sm text-red-900 font-semibold uppercase tracking-wide mb-2">
                LIABILITY LIMITATIONS
              </p>
              <p className="text-sm text-red-800 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PERSONAL ACADEMY APP SHALL NOT BE LIABLE FOR 
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              In no event shall Personal Academy APP, its directors, employees, partners, agents, 
              suppliers, or affiliates be liable for:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                <p className="text-gray-800">
                  <strong>1. Indirect Damages:</strong> Loss of profits, revenue, data, use, goodwill, 
                  or other intangible losses
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                <p className="text-gray-800">
                  <strong>2. User Content:</strong> Any errors, inaccuracies, or harmful content in 
                  AI-generated materials
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                <p className="text-gray-800">
                  <strong>3. Third Parties:</strong> Any unauthorized access to or use of our servers 
                  and/or personal information
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                <p className="text-gray-800">
                  <strong>4. Service Interruption:</strong> Any interruption or cessation of transmission 
                  to or from our Platform
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                <p className="text-gray-800">
                  <strong>5. Third-Party Content:</strong> Any bugs, viruses, or harmful code transmitted 
                  through our Platform by third parties
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <p className="text-sm text-blue-900">
                <strong>Maximum Liability:</strong> Our total liability to you for all claims arising 
                from or relating to these Terms or your use of the Platform shall not exceed the amount 
                you paid us in the 12 months preceding the claim, or ₹5,000 (whichever is greater).
              </p>
            </div>

            <p className="text-gray-600 text-sm mt-4">
              Some jurisdictions do not allow the exclusion of certain warranties or limitation of 
              liability for incidental or consequential damages. In such jurisdictions, our liability 
              will be limited to the maximum extent permitted by law.
            </p>
          </div>
        </section>

        {/* 12. Governing Law */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            12. Governing Law and Jurisdiction
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">12.1 Governing Law</h3>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Use shall be governed by and construed in accordance with the laws of 
                India, without regard to its conflict of law provisions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">12.2 Jurisdiction</h3>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising out of or relating to these Terms or your use of the Platform 
                shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, 
                Telangana, India.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">12.3 Dispute Resolution</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Before filing any legal action, we encourage you to contact us to seek an informal 
                resolution. For formal dispute resolution procedures, please refer to our{' '}
                <Link href="/trust/terms-of-service" className="text-blue-600 hover:underline font-medium">
                  Terms of Service
                </Link>.
              </p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-indigo-900">
                <strong>📧 Contact for Disputes:</strong>{' '}
                <a href={`mailto:${getContactEmail('legal')}`} className="text-indigo-600 hover:underline font-medium">
                  {getContactEmail('legal')}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* 13. Severability */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            13. Severability and Waiver
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">13.1 Severability</h3>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid under applicable 
                law, such provision will be modified to reflect the parties&apos; intention or eliminated 
                to the minimum extent necessary, and the remaining provisions will remain in full force 
                and effect.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">13.2 Waiver</h3>
              <p className="text-gray-700 leading-relaxed">
                Our failure to enforce any right or provision of these Terms will not be considered a 
                waiver of those rights. Any waiver of any provision of these Terms will be effective 
                only if in writing and signed by Personal Academy APP.
              </p>
            </div>
          </div>
        </section>

        {/* 14. Contact Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            14. Contact Information
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-700 mb-4">
              If you have any questions, concerns, or feedback about these Terms of Use, please contact us:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Legal Inquiries
                </h4>
                <p className="text-sm text-blue-800 mb-2">For legal questions and compliance matters:</p>
                <a 
                  href={`mailto:${getContactEmail('legal')}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <span>{getContactEmail('legal')}</span>
                  <span>→</span>
                </a>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  General Support
                </h4>
                <p className="text-sm text-green-800 mb-2">For general questions and support:</p>
                <a 
                  href={`mailto:${getContactEmail('support')}`}
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  <span>{getContactEmail('support')}</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Mailing Address</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {COMPANY_INFO.legalName}<br />
                {COMPANY_INFO.address.full}
              </p>
            </div>
          </div>
        </section>

        {/* Acknowledgment */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h3 className="font-bold text-green-900 mb-3 text-lg">
            ✓ Acknowledgment and Acceptance
          </h3>
          <p className="text-green-800 leading-relaxed">
            BY USING PERSONAL ACADEMY, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF USE, 
            UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, 
            YOU MUST NOT ACCESS OR USE OUR PLATFORM.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t">
          <Link 
            href="/trust/gdpr"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>GDPR Compliance</span>
          </Link>

          <Link 
            href="/trust"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <Home className="w-4 h-4" />
            <span>Back to Trust Center</span>
          </Link>

          <Link 
            href="/trust/terms-of-service"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>Terms of Service</span>
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
