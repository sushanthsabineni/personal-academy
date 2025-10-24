// Next.js
import Link from 'next/link';

// External libraries
import { FileText, ChevronRight, Home, CreditCard, Shield, Scale, AlertTriangle, Ban } from '@/lib/icons';

// Internal utilities
import { 
  COMPANY_INFO, 
  SERVICE_DETAILS,
  CREDIT_SYSTEM,
  DISPUTE_RESOLUTION,
  getContactEmail,
  formatDate 
} from '@/lib/legalContent';

export default function TermsOfServicePage() {
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
            <span className="text-gray-900 font-medium">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
              <p className="text-orange-100">
                Last Updated: {formatDate(COMPANY_INFO.lastUpdated)}
              </p>
            </div>
          </div>
          <p className="text-lg text-orange-50 max-w-3xl">
            This agreement governs your subscription to Personal Academy&apos;s AI-powered course 
            generation services, including credit packages, payments, and platform usage.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Agreement Scope</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                These Terms of Service govern your subscription and use of Personal Academy&apos;s 
                services. For website usage rules and conduct, see our{' '}
                <Link href="/trust/terms-of-use" className="underline font-medium">Terms of Use</Link>. 
                For data protection, see our{' '}
                <Link href="/trust/privacy" className="underline font-medium">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Agreement to Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Scale className="w-6 h-6 text-orange-600" />
            1. Agreement to Terms
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              By purchasing credits, subscribing to, or using Personal Academy&apos;s services 
              (&quot;Services&quot;), you enter into a legally binding agreement with Personal Academy APP 
              and agree to these Terms of Service (&quot;Agreement&quot;).
            </p>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1.1 Definitions</h3>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <strong className="text-gray-900">&quot;Services&quot;</strong> - AI-powered course generation, 
                  content creation tools, and related features provided through our Platform
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong className="text-gray-900">&quot;Credits&quot;</strong> - Prepaid units used to access 
                  AI features and generate courses
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong className="text-gray-900">&quot;User&quot;, &quot;You&quot;</strong> - The individual or 
                  entity purchasing and using our Services
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong className="text-gray-900">&quot;Platform&quot;</strong> - Personal Academy website, 
                  applications, and related infrastructure
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1.2 Acceptance</h3>
              <p className="text-gray-700 leading-relaxed">
                You accept this Agreement by: (a) clicking &quot;I Agree&quot; or similar buttons, 
                (b) purchasing credits or subscribing to Services, or (c) accessing or using the Services. 
                If you do not agree, you must not use our Services.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Service Description */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            2. Service Description
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {SERVICE_DETAILS.description}
            </p>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">2.1 Features Included</h3>
              <div className="grid gap-2">
                {SERVICE_DETAILS.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 font-bold flex-shrink-0">✓</span>
                    <span className="text-gray-800">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2.2 AI Technology</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Our Services utilize {SERVICE_DETAILS.aiProvider} to generate educational content. 
                We select AI models that provide the most effective educational content generation.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-900">
                  <strong>Important:</strong> AI-generated content may contain errors or inaccuracies. 
                  You are responsible for reviewing, verifying, and editing all generated content before use.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2.3 Data Storage</h3>
              <p className="text-gray-700 leading-relaxed">
                Your account data and generated courses are stored securely in {SERVICE_DETAILS.dataStorage}, 
                ensuring compliance with Indian data protection regulations.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Credit System */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-600" />
            3. Credit System and Pricing
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Personal Academy operates on a credit-based system. You purchase credits to access 
              AI-powered features and generate courses.
            </p>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">3.1 Credit Packages</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {CREDIT_SYSTEM.packages.map((pkg, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 transition-colors">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{pkg.name}</h4>
                    <p className="text-3xl font-bold text-orange-600 mb-2">₹{pkg.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mb-3">{pkg.credits.toLocaleString()} Credits</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3.2 Credit Usage</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Credits are deducted each time you use AI features (course generation, content creation, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Credit cost varies based on feature complexity and AI model usage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>You can check your credit balance anytime in your account dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Credits are non-transferable between accounts</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3.3 Credit Expiration</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-red-900 font-semibold mb-2">⚠️ Important Expiration Policy</p>
                <p className="text-red-800 text-sm leading-relaxed">
                  All credits expire {CREDIT_SYSTEM.expirationDays} days (365 days) from the date of 
                  purchase. Unused credits after this period will be forfeited and cannot be recovered 
                  or refunded.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3.4 Unused Credits</h3>
              <p className="text-gray-700 leading-relaxed">
                {CREDIT_SYSTEM.onCancellation} If you delete your account, {CREDIT_SYSTEM.onAccountDeletion.toLowerCase()}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3.5 Price Changes</h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify credit package pricing at any time. Price changes 
                will not affect credits already purchased. We will notify you of price changes via 
                email and Platform notifications at least 30 days in advance.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Payment Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            4. Payment Terms
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4.1 Payment Methods</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We accept payments through the following secure payment processors:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🇮🇳 Razorpay (India)</h4>
                  <p className="text-sm text-blue-800 mb-2">For customers in India</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Credit/Debit Cards</li>
                    <li>• UPI</li>
                    <li>• Net Banking</li>
                    <li>• Wallets (Paytm, PhonePe, etc.)</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">🌍 Stripe (International)</h4>
                  <p className="text-sm text-purple-800 mb-2">For international customers</p>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• Credit/Debit Cards (Visa, Mastercard, Amex)</li>
                    <li>• International payment methods</li>
                    <li>• Multi-currency support</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4.2 Payment Security</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                All payments are processed through PCI DSS compliant payment gateways. 
                We do not store your complete credit card numbers or CVV codes on our servers.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-900">
                  <strong>🔒 Security Guarantee:</strong> Your payment information is encrypted using 
                  industry-standard SSL/TLS protocols and processed by certified payment processors.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4.3 Taxes</h3>
              <p className="text-gray-700 leading-relaxed">
                All prices are exclusive of applicable taxes, including but not limited to GST 
                (Goods and Services Tax) in India. Taxes will be added at checkout based on your 
                location and local tax regulations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4.4 Payment Confirmation</h3>
              <p className="text-gray-700 leading-relaxed">
                Upon successful payment, you will receive: (a) an email receipt, (b) immediate 
                credit addition to your account, and (c) a transaction record in your account history. 
                If credits are not added within 10 minutes, contact our support team.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4.5 Failed Payments</h3>
              <p className="text-gray-700 leading-relaxed">
                If a payment fails, we will notify you via email. Your access to Services may be 
                suspended until payment is successfully processed. We are not responsible for fees 
                charged by your bank or card issuer for failed transactions.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Refund Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Ban className="w-6 h-6 text-orange-600" />
            5. Refund Policy
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
              <h3 className="font-bold text-red-900 text-lg mb-3 flex items-center gap-2">
                <Ban className="w-6 h-6" />
                NO REFUNDS POLICY
              </h3>
              <p className="text-red-800 leading-relaxed mb-3">
                {CREDIT_SYSTEM.refundPolicy}
              </p>
              <p className="text-red-700 text-sm font-semibold">
                ALL SALES ARE FINAL. CREDITS ARE NON-REFUNDABLE ONCE PURCHASED.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5.1 Why No Refunds?</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Credits provide immediate access to AI-powered services. Once purchased:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Credits are instantly added to your account and available for use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>You gain immediate access to premium AI features and models</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>We incur costs for AI processing and infrastructure from third-party providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Digital products cannot be &quot;returned&quot; like physical goods</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5.2 Exceptions</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Refunds may be considered ONLY in the following exceptional circumstances:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Duplicate Charges:</strong> If you were accidentally charged multiple times 
                  for the same purchase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Technical Error:</strong> If credits were not added to your account due 
                  to a system error AND the issue cannot be resolved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span><strong>Fraudulent Transaction:</strong> If your account was compromised and 
                  unauthorized purchases were made (requires proof)</span>
                </li>
              </ul>
              <p className="text-gray-600 text-sm mt-3">
                To request an exceptional refund, contact {getContactEmail('support')} within 7 days 
                of purchase with detailed documentation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5.3 Before You Purchase</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-900">
                  <strong>Please Note:</strong> We encourage you to carefully review package details, 
                  pricing, and credit costs before purchasing. If you have questions, contact our 
                  support team before completing your purchase.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. License and Restrictions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            6. License Grant and Restrictions
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">6.1 License Grant</h3>
              <p className="text-gray-700 leading-relaxed">
                Subject to your compliance with this Agreement, we grant you a limited, non-exclusive, 
                non-transferable, revocable license to access and use the Services for your personal 
                or commercial educational purposes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">6.2 Restrictions</h3>
              <p className="text-gray-700 mb-3">You may NOT:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-800">Resell, sublicense, or redistribute credits to third parties</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-800">Share your account credentials or credits with others</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-800">Use the Services to create a competing AI course generation platform</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-800">Reverse engineer, decompile, or attempt to extract our AI prompts or algorithms</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-800">Use automated scripts, bots, or tools to abuse the Services or consume credits</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-800">Bypass rate limits, credit requirements, or other technical restrictions</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">6.3 Ownership of Generated Content</h3>
              <p className="text-gray-700 leading-relaxed">
                You retain all rights to content you create using our Services. However, you acknowledge 
                that similar content may be generated for other users, as AI models may produce comparable 
                outputs for similar inputs.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Account Termination */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            7. Account Termination and Suspension
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">7.1 Termination by You</h3>
              <p className="text-gray-700 leading-relaxed">
                You may terminate your account at any time through your account settings or by 
                contacting support. Upon termination:
              </p>
              <ul className="mt-3 space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Your access to Services will cease immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>All unused credits will be forfeited (no refunds)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Your generated courses and content will remain accessible for 30 days for download</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>After 30 days, all your data will be permanently deleted</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">7.2 Termination by Personal Academy</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We reserve the right to suspend or terminate your account immediately, without notice, if:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>You violate these Terms of Service or Terms of Use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>You engage in fraudulent, abusive, or illegal activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>You abuse our Services or attempt to harm our Platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Your payment is reversed or disputed (chargeback)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>We are required to do so by law or legal process</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">7.3 Effect of Termination</h3>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-red-900 font-semibold mb-2">No Refunds on Termination</p>
                <p className="text-red-800 text-sm">
                  If we terminate your account due to your violation of this Agreement, you will NOT 
                  be entitled to any refund of unused credits or subscription fees. All amounts paid 
                  are forfeited.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">7.4 Appeal Process</h3>
              <p className="text-gray-700 leading-relaxed">
                If you believe your account was terminated in error, you may appeal by contacting {' '}
                <a href={`mailto:${getContactEmail('support')}`} className="text-blue-600 hover:underline">
                  {getContactEmail('support')}
                </a> within 14 days of termination with a detailed explanation.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Warranties and Disclaimers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-orange-600" />
            8. Warranties and Disclaimers
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
              <p className="text-sm text-red-900 font-semibold uppercase tracking-wide mb-3">
                DISCLAIMER OF WARRANTIES
              </p>
              <p className="text-red-800 leading-relaxed mb-3">
                THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT 
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8.1 AI Content Disclaimer</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                We do not warrant that AI-generated content will be accurate, complete, error-free, or 
                suitable for your purposes. You acknowledge that AI models may produce inaccurate, incomplete, 
                biased, or inappropriate content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8.2 Service Availability</h3>
              <p className="text-gray-700 leading-relaxed">
                We do not guarantee that the Services will be available at all times or that they will be 
                free from errors, viruses, or other harmful components. We may suspend or terminate Services 
                for maintenance, updates, or technical issues without prior notice.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8.3 Third-Party AI Models</h3>
              <p className="text-gray-700 leading-relaxed">
                Our Services rely on third-party AI providers. We are not responsible for the performance, 
                availability, or quality of third-party AI models. Changes or discontinuation of third-party 
                services may affect our Services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8.4 No Professional Advice</h3>
              <p className="text-gray-700 leading-relaxed">
                Our Services do not provide professional advice (legal, medical, financial, or otherwise). 
                AI-generated content should not be used as a substitute for professional consultation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8.5 Your Responsibility</h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-900">
                  <strong>YOU ARE SOLELY RESPONSIBLE</strong> for reviewing, verifying, and validating 
                  all AI-generated content before use. We strongly recommend fact-checking, editing, 
                  and customizing all generated materials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Limitation of Liability */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            9. Limitation of Liability
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
              <p className="text-sm text-red-900 font-semibold uppercase tracking-wide mb-3">
                LIMITATION OF LIABILITY
              </p>
              <p className="text-red-800 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PERSONAL ACADEMY APP SHALL NOT BE LIABLE FOR 
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF 
                PROFITS OR REVENUES.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">9.1 Excluded Damages</h3>
              <p className="text-gray-700 mb-3">We are NOT liable for:</p>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Loss of profits, revenue, data, use, goodwill, or other intangible losses</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Any errors, inaccuracies, or harmful content in AI-generated materials</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Any unauthorized access to or use of our servers and/or personal information</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Any interruption or cessation of transmission to or from our Services</span>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Any bugs, viruses, or harmful code transmitted through third-party services</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">9.2 Maximum Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                Our total liability to you for all claims arising from or relating to this Agreement shall 
                not exceed the amount you paid us in the 12 months preceding the claim, or ₹5,000 
                (whichever is greater).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">9.3 Jurisdictional Limitations</h3>
              <p className="text-gray-700 leading-relaxed">
                Some jurisdictions do not allow the exclusion or limitation of incidental or consequential 
                damages. In such jurisdictions, our liability will be limited to the maximum extent 
                permitted by law.
              </p>
            </div>
          </div>
        </section>

        {/* 10. Indemnification */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            10. Indemnification
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Personal Academy APP, its officers, 
              directors, employees, agents, and affiliates from and against any claims, liabilities, 
              damages, losses, and expenses, including reasonable legal fees, arising out of or in any 
              way connected with:
            </p>

            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span>Your access to or use of the Services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span>Your violation of these Terms of Service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span>Your violation of any third-party rights, including intellectual property rights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span>Your use or distribution of AI-generated content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span>Any unauthorized use of your account</span>
              </li>
            </ul>

            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-blue-900">
                This indemnification obligation will survive the termination of your account and 
                this Agreement.
              </p>
            </div>
          </div>
        </section>

        {/* 11. Dispute Resolution */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            11. Dispute Resolution and Arbitration
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">11.1 Informal Resolution</h3>
              <p className="text-gray-700 leading-relaxed">
                If a dispute arises, please contact us at {getContactEmail('legal')} to resolve it informally. 
                We will attempt to resolve the dispute through good faith negotiations for at least 30 days 
                before either party initiates formal arbitration or legal proceedings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">11.2 Binding Arbitration</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                If informal resolution fails, any dispute shall be finally resolved by binding arbitration 
                under the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in 
                Hyderabad, Telangana, India, in the English language.
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Arbitration Details:</h4>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• <strong>Governing Law:</strong> {DISPUTE_RESOLUTION.governingLaw}</li>
                  <li>• <strong>Location:</strong> {DISPUTE_RESOLUTION.jurisdiction}</li>
                  <li>• <strong>Procedure:</strong> Arbitration and Conciliation Act, 1996</li>
                  <li>• <strong>Language:</strong> English</li>
                  <li>• <strong>Decision:</strong> Final and binding on both parties</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">11.3 Exceptions to Arbitration</h3>
              <p className="text-gray-700 leading-relaxed">
                Either party may seek injunctive relief in court to prevent actual or threatened 
                infringement, misappropriation, or violation of intellectual property rights.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">11.4 Class Action Waiver</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-900">
                  <strong>Important:</strong> You agree that any arbitration or legal proceedings shall 
                  be conducted on an individual basis and NOT as a class action, consolidated action, 
                  or representative action.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 12. Changes to Terms */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            12. Changes to These Terms
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. When we make material 
              changes, we will:
            </p>

            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">1.</span>
                <span>Update the &quot;Last Updated&quot; date at the top of this page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">2.</span>
                <span>Send you an email notification to your registered email address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">3.</span>
                <span>Display a prominent notice on our Platform for at least 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">4.</span>
                <span>Require you to accept the new terms before making new purchases</span>
              </li>
            </ul>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <p className="text-sm text-blue-900">
                <strong>Your Continued Use:</strong> By continuing to use our Services after changes 
                become effective, you agree to be bound by the revised terms. If you do not agree to 
                the new terms, you must stop using the Services and may request account termination.
              </p>
            </div>
          </div>
        </section>

        {/* 13. General Provisions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            13. General Provisions
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">13.1 Entire Agreement</h3>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service, together with our Privacy Policy, Terms of Use, and any other 
                legal notices published on the Platform, constitute the entire agreement between you 
                and Personal Academy APP.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">13.2 Severability</h3>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision 
                will be limited or eliminated to the minimum extent necessary, and the remaining provisions 
                will remain in full force and effect.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">13.3 Assignment</h3>
              <p className="text-gray-700 leading-relaxed">
                You may not assign or transfer these Terms or your rights hereunder without our prior 
                written consent. We may assign our rights and obligations without restriction.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">13.4 Force Majeure</h3>
              <p className="text-gray-700 leading-relaxed">
                We shall not be liable for any failure to perform our obligations due to events beyond 
                our reasonable control, including but not limited to natural disasters, war, terrorism, 
                pandemics, or failures of third-party services (AI providers, payment processors, etc.).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">13.5 Survival</h3>
              <p className="text-gray-700 leading-relaxed">
                The following sections shall survive termination of this Agreement: Refund Policy, 
                Intellectual Property, Warranties and Disclaimers, Limitation of Liability, 
                Indemnification, Dispute Resolution, and General Provisions.
              </p>
            </div>
          </div>
        </section>

        {/* 14. Contact Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            14. Contact Us
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service, your subscription, or billing inquiries:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Legal & Terms Questions
                </h4>
                <p className="text-sm text-orange-800 mb-2">For legal inquiries and compliance:</p>
                <a 
                  href={`mailto:${getContactEmail('legal')}`}
                  className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
                >
                  <span>{getContactEmail('legal')}</span>
                  <span>→</span>
                </a>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing & Support
                </h4>
                <p className="text-sm text-blue-800 mb-2">For billing, credits, and technical support:</p>
                <a 
                  href={`mailto:${getContactEmail('support')}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <span>{getContactEmail('support')}</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Business Address</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {COMPANY_INFO.legalName}<br />
                {COMPANY_INFO.address.full}
              </p>
            </div>
          </div>
        </section>

        {/* Acknowledgment */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 rounded-lg">
          <h3 className="font-bold text-orange-900 mb-3 text-lg">
            ✓ Agreement Acknowledgment
          </h3>
          <p className="text-orange-800 leading-relaxed mb-3">
            BY PURCHASING CREDITS OR USING OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, 
            UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
          </p>
          <p className="text-orange-700 text-sm font-semibold">
            IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT PURCHASE CREDITS OR USE OUR SERVICES.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t">
          <Link 
            href="/trust/terms-of-use"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Terms of Use</span>
          </Link>

          <Link 
            href="/trust"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <Home className="w-4 h-4" />
            <span>Back to Trust Center</span>
          </Link>

          <Link 
            href="/trust/privacy"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>Privacy Policy</span>
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
