"use client";

import Link from "next/link";
import { FileText, Shield, Lock, Eye, Trash2, Download, ChevronRight } from "lucide-react";
import {
  COMPANY_INFO,
  DATA_COLLECTION,
  DATA_USAGE_PURPOSES,
  THIRD_PARTY_SERVICES,
  USER_RIGHTS,
  DATA_RETENTION,
  COOKIE_POLICY,
  getContactEmail
} from "@/lib/legalContent";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/trust" className="hover:underline">Trust Center</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Privacy Policy</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Last Updated: {COMPANY_INFO.lastUpdated}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                Welcome to {COMPANY_INFO.displayName}. We are {COMPANY_INFO.legalName}, 
                located at {COMPANY_INFO.address.full}. This Privacy Policy describes how we collect, 
                use, share, and protect your personal information when you use our AI-powered course 
                generation platform and related services (collectively, the &quot;Services&quot;).
              </p>
              <p>
                By using our Services, you consent to the collection and use of your information as 
                described in this Privacy Policy. If you do not agree with this policy, please do not 
                use our Services.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                <p className="font-semibold text-blue-900 mb-2">Important Note:</p>
                <p className="text-blue-800">
                  We are committed to protecting your privacy and complying with GDPR (EU), DPDP Act 2023 
                  (India), CCPA (California), and other applicable data protection laws. You have comprehensive 
                  rights over your personal data, which are detailed throughout this policy.
                </p>
              </div>
            </div>
          </section>

          {/* Scope */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Scope of This Policy</h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>This Privacy Policy applies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Visitors to our website</li>
                <li>Users who create accounts and use our Services</li>
                <li>Individuals who interact with our AI course generation features</li>
                <li>Customers who purchase credits and use paid features</li>
                <li>Participants in our referral program</li>
                <li>Anyone who contacts us for support or inquiries</li>
              </ul>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-600" />
              Information We Collect
            </h2>
            
            {/* Account Information */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Account Information</h3>
              <p className="text-gray-700 mb-3">
                When you create an account with {COMPANY_INFO.displayName}, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {DATA_COLLECTION.accountInfo.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Course Content */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Course Content and AI Usage Data</h3>
              <p className="text-gray-700 mb-3">
                When you use our AI course generation features, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {DATA_COLLECTION.courseContent.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                <p className="font-semibold text-amber-900 mb-2">Important AI Disclosure:</p>
                <p className="text-amber-800">
                  We do NOT use your course content, prompts, or any user-generated data to train our 
                  AI models or any third-party AI models. Your content remains your intellectual property 
                  and is only used to generate the courses you request.
                </p>
              </div>
            </div>

            {/* Usage Data */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Usage and Activity Data</h3>
              <p className="text-gray-700 mb-3">
                We automatically collect information about how you use our Services:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {DATA_COLLECTION.usageData.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Payment Information</h3>
              <p className="text-gray-700 mb-3">
                When you purchase credits, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {DATA_COLLECTION.paymentInfo.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-gray-600 text-sm mt-3">
                <strong>Security Note:</strong> We do NOT store your complete credit/debit card numbers 
                or CVV codes. All payment processing is handled securely by our payment partners 
                (Razorpay and Stripe) who are PCI DSS compliant.
              </p>
            </div>

            {/* Technical Data */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Technical and Device Information</h3>
              <p className="text-gray-700 mb-3">
                We automatically collect technical information:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {DATA_COLLECTION.technicalData.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <div className="space-y-4">
              {DATA_USAGE_PURPOSES.map((purpose, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{purpose.purpose}</h3>
                  <p className="text-gray-700">{purpose.details}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Third-Party Services and Data Sharing
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                We share your information with carefully selected third-party service providers who 
                help us deliver our Services. We do NOT sell your personal information to anyone.
              </p>
            </div>
            <div className="space-y-4">
              {THIRD_PARTY_SERVICES.map((service, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                      {service.location}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Purpose:</strong> {service.purpose}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Data Shared:</strong> {service.dataShared}
                  </p>
                  <a
                    href={service.privacy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    View their Privacy Policy
                    <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12" id="cookies">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Similar Technologies</h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                We use cookies and similar tracking technologies to provide, protect, and improve 
                our Services. Cookies are small data files stored on your device.
              </p>
            </div>

            {/* Essential Cookies */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Essential Cookies (Required)</h3>
              <p className="text-gray-700 mb-3">
                These cookies are necessary for the Services to function properly:
              </p>
              <div className="space-y-2">
                {COOKIE_POLICY.essential.map((cookie, index) => (
                  <div key={index} className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{cookie.name}</p>
                        <p className="text-sm text-gray-600">{cookie.purpose}</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                        {cookie.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics Cookies (Optional)</h3>
              <p className="text-gray-700 mb-3">
                These cookies help us understand how users interact with our Services:
              </p>
              <div className="space-y-2">
                {COOKIE_POLICY.analytics.map((cookie, index) => (
                  <div key={index} className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{cookie.name}</p>
                        <p className="text-sm text-gray-600">{cookie.purpose}</p>
                        {cookie.optOut && (
                          <a
                            href={cookie.optOut}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                          >
                            Opt-out available here
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 whitespace-nowrap ml-2">
                        {cookie.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketing Cookies (Optional)</h3>
              <p className="text-gray-700 mb-3">
                These cookies are used for marketing and advertising purposes:
              </p>
              <div className="space-y-2">
                {COOKIE_POLICY.marketing.map((cookie, index) => (
                  <div key={index} className="bg-gray-50 rounded p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{cookie.name}</p>
                        <p className="text-sm text-gray-600">{cookie.purpose}</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                        {cookie.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-blue-900">
                <strong>Managing Cookies:</strong> You can manage your cookie preferences through your 
                browser settings. However, disabling certain cookies may limit your ability to use some 
                features of our Services. Most browsers allow you to refuse cookies or delete cookies 
                already stored.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                We retain your personal information only as long as necessary to provide our Services 
                and comply with legal obligations:
              </p>
            </div>
            <div className="space-y-3">
              {Object.entries(DATA_RETENTION).map(([key, value], index) => (
                <div key={index} className="flex items-start gap-3 bg-gray-50 rounded p-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-gray-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Your Rights - GDPR */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Your Rights Under GDPR (EU Users)
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, 
                you have the following rights under GDPR:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {USER_RIGHTS.gdpr.map((right, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{right.right}</h3>
                  <p className="text-sm text-gray-700">{right.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-blue-900">
                <strong>How to Exercise Your Rights:</strong> Contact us at{' '}
                <a href={`mailto:${getContactEmail('legal')}`} className="text-blue-600 hover:underline">
                  {getContactEmail('legal')}
                </a>
                {' '}with your request. We will respond within 30 days.
              </p>
            </div>
          </section>

          {/* Your Rights - DPDP Act */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-600" />
              Your Rights Under DPDP Act 2023 (Indian Users)
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                If you are located in India, you have the following rights under the Digital Personal 
                Data Protection Act, 2023:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {USER_RIGHTS.dpdpAct.map((right, index) => (
                <div key={index} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{right.right}</h3>
                  <p className="text-sm text-gray-700">{right.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Your Rights - CCPA */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              Your Rights Under CCPA (California Residents)
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                If you are a California resident, you have the following rights under the California 
                Consumer Privacy Act (CCPA):
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {USER_RIGHTS.ccpa.map((right, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{right.right}</h3>
                  <p className="text-sm text-gray-700">{right.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-green-900">
                <strong>Important:</strong> We do NOT sell your personal information. We do NOT share 
                your information for cross-context behavioral advertising. You have the right to opt-out, 
                but there is nothing to opt out of since we don&apos;t engage in these practices.
              </p>
            </div>
          </section>

          {/* International Data Transfers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                Your data is primarily stored in India (Supabase India Region). However, some of our 
                service providers (such as OpenAI for AI processing, and Stripe for international 
                payments) may process data outside India, including in the United States and European Union.
              </p>
              <p>
                When we transfer personal data internationally, we ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses (SCCs) approved by regulatory authorities</li>
                <li>Adequacy decisions from relevant data protection authorities</li>
                <li>Binding Corporate Rules where applicable</li>
                <li>Your explicit consent where required</li>
              </ul>
              <p>
                For EU users, we comply with EU-US Data Privacy Framework and UK Extension where applicable.
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-600" />
              Security Measures
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                We implement comprehensive security measures to protect your personal information from 
                unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> All data in transit is encrypted using TLS/SSL. Sensitive data at rest is encrypted.</li>
                <li><strong>Access Control:</strong> Role-based access control (RBAC) limits who can access your data.</li>
                <li><strong>Authentication:</strong> Multi-factor authentication (MFA) support for user accounts.</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and automated threat detection.</li>
                <li><strong>Audits:</strong> Regular security audits and vulnerability assessments.</li>
                <li><strong>Backups:</strong> Automated encrypted backups with 90-day retention.</li>
                <li><strong>Incident Response:</strong> Documented incident response procedures and data breach notification protocols.</li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-6">
                <p className="text-red-900">
                  <strong>Security Breach Notification:</strong> In the unlikely event of a data breach 
                  affecting your personal information, we will notify you and relevant authorities within 
                  72 hours as required by GDPR and applicable laws.
                </p>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children&apos;s Privacy</h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                Our Services are not intended for children under the age of 18. We do not knowingly 
                collect personal information from children under 18. If you are under 18, please do not 
                use our Services or provide any information to us.
              </p>
              <p>
                If we discover that we have collected personal information from a child under 18, we will 
                delete that information immediately. If you believe we have collected information from a 
                child, please contact us at{' '}
                <a href={`mailto:${getContactEmail('legal')}`} className="text-blue-600 hover:underline">
                  {getContactEmail('legal')}
                </a>.
              </p>
            </div>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, 
                technology, legal requirements, or other factors. We will notify you of any material 
                changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Posting a notice on our website</li>
                <li>Sending an email to your registered email address</li>
                <li>Displaying an in-app notification</li>
              </ul>
              <p>
                The &quot;Last Updated&quot; date at the top of this policy indicates when it was last revised. 
                Your continued use of the Services after changes become effective constitutes your 
                acceptance of the revised policy.
              </p>
            </div>
          </section>

          {/* Contact Us */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our 
                data practices, please contact us:
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>Legal Name:</strong> {COMPANY_INFO.legalName}</p>
                <p><strong>Address:</strong> {COMPANY_INFO.address.full}</p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${getContactEmail('legal')}`} className="text-blue-600 hover:underline">
                    {getContactEmail('legal')}
                  </a>
                </p>
                <p><strong>Support:</strong>{' '}
                  <a href={`mailto:${COMPANY_INFO.contact.support}`} className="text-blue-600 hover:underline">
                    {COMPANY_INFO.contact.support}
                  </a>
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600">
                  <strong>Response Time:</strong> We will respond to all privacy-related inquiries within 
                  30 days. For urgent security concerns, please mark your email as &quot;URGENT - SECURITY&quot;.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href={`mailto:${getContactEmail('legal')}?subject=Data Access Request`}
                className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 border border-blue-200 transition-colors"
              >
                <Download className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Request Your Data</p>
                  <p className="text-xs text-gray-600">Download all your data</p>
                </div>
              </a>
              <a
                href={`mailto:${getContactEmail('legal')}?subject=Account Deletion Request`}
                className="flex items-center gap-3 bg-red-50 hover:bg-red-100 rounded-lg p-4 border border-red-200 transition-colors"
              >
                <Trash2 className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold text-gray-900">Delete Account</p>
                  <p className="text-xs text-gray-600">Remove all your data</p>
                </div>
              </a>
              <Link
                href="/trust/gdpr"
                className="flex items-center gap-3 bg-green-50 hover:bg-green-100 rounded-lg p-4 border border-green-200 transition-colors"
              >
                <Shield className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">GDPR Rights</p>
                  <p className="text-xs text-gray-600">Learn about your rights</p>
                </div>
              </Link>
            </div>
          </section>

        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/trust"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Trust Center
          </Link>
          <Link
            href="/trust/gdpr"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            View GDPR Compliance
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
