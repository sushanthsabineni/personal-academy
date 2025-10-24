"use client";

import Link from "next/link";
import { Globe, Shield, FileCheck, Database, Lock, ChevronRight, ExternalLink, Mail, CheckCircle } from "lucide-react";
import {
  COMPANY_INFO,
  GDPR_PRINCIPLES,
  USER_RIGHTS,
  THIRD_PARTY_SERVICES,
  getContactEmail
} from "@/lib/legalContent";

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/trust" className="hover:underline">Trust Center</Link>
            <ChevronRight className="w-4 h-4" />
            <span>GDPR Compliance</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Globe className="w-12 h-12" />
            <h1 className="text-4xl font-bold">GDPR Compliance</h1>
          </div>
          <p className="text-purple-100 text-lg">
            Our commitment to the EU General Data Protection Regulation
          </p>
          <p className="text-purple-100 text-sm mt-2">
            Last Updated: {COMPANY_INFO.lastUpdated}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          
          {/* Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">GDPR Overview</h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                The European General Data Protection Regulation (GDPR) became enforceable on May 25, 2018. 
                The United Kingdom (UK) adopted its own UK GDPR post-Brexit. The GDPR is a comprehensive 
                regulation on the collection and processing of personal data related to individuals 
                residing within the European Union (EU) and the UK.
              </p>
              <p>
                At {COMPANY_INFO.displayName}, we value our worldwide customer base and your right to privacy. 
                We welcome the GDPR as an opportunity to deepen our commitment to data protection, regardless 
                of where our users are located.
              </p>
            </div>
            <div className="mt-6 bg-purple-50 border-l-4 border-purple-500 p-4">
              <p className="text-purple-900">
                <strong>Important:</strong> Even if you are not located in the EU/EEA/UK, we apply GDPR-level 
                protections to all our users globally. Data privacy is a fundamental right that we respect 
                universally.
              </p>
            </div>
          </section>

          {/* GDPR's Six Key Principles */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              GDPR&apos;s Six Key Principles
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                As detailed in Article 5 of the GDPR legislation, personal data must be:
              </p>
            </div>
            <div className="space-y-4">
              {GDPR_PRINCIPLES.map((principle, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{principle.principle}</h3>
                      <p className="text-gray-700"><strong>Our Commitment:</strong> {principle.ourCommitment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Our Role */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-600" />
              Our Role: Data Controller
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                Under GDPR, {COMPANY_INFO.displayName} acts as the <strong>Data Controller</strong> for 
                the personal data you provide to us. This means we determine the purposes and means of 
                processing your personal data.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">As Data Controller, we commit that:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Data is collected conservatively and with your consent</li>
                <li>You can correct, delete, and manage your data at any time</li>
                <li>Data is always protected with necessary safeguards</li>
                <li>We are transparent about what data we collect and how we use it</li>
                <li>We engage only carefully vetted sub-processors (detailed below)</li>
                <li>We require all subprocessors to sign Data Processing Agreements (DPAs) compliant with GDPR</li>
              </ul>
            </div>
          </section>

          {/* Data Processing Agreement */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-blue-600" />
              Data Processing Agreement (DPA)
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                For customers who process personal data of EU/EEA/UK residents through our Services, we 
                offer a comprehensive Data Processing Agreement (DPA) that includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Clear definitions of roles and responsibilities</li>
                <li>Data processing instructions and limitations</li>
                <li>Security measures and breach notification procedures</li>
                <li>Sub-processor requirements and approval mechanisms</li>
                <li>Data subject rights assistance</li>
                <li>Data deletion and return upon termination</li>
              </ul>
            </div>
            <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Request a DPA</h3>
              <p className="text-gray-700 mb-4">
                If you need a signed Data Processing Agreement for your records or compliance requirements, 
                please contact our legal team:
              </p>
              <a
                href={`mailto:${getContactEmail('legal')}?subject=DPA Request`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Request DPA
              </a>
            </div>
          </section>

          {/* Subprocessors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-green-600" />
              Subprocessors (Third-Party Providers)
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                We engage carefully vetted sub-processors for specific purposes necessary to deliver our 
                Services. Each subprocessor has signed a Data Processing Agreement (DPA) that complies with 
                GDPR requirements.
              </p>
            </div>
            <div className="space-y-4">
              {THIRD_PARTY_SERVICES.map((service, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.purpose}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs bg-white px-3 py-1 rounded border border-gray-300 whitespace-nowrap">
                        {service.location}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded border border-green-300">
                        GDPR Compliant
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Data Shared:</span>
                      <span className="text-gray-600 ml-2">{service.dataShared}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Privacy Policy:</span>
                      <a
                        href={service.privacy}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        View Policy
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-green-900">
                <strong>Subprocessor Updates:</strong> We will notify customers at least 30 days in advance 
                if we add or change any subprocessor. You have the right to object to any new subprocessor 
                on reasonable grounds.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Rights as a Data Subject
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                Under GDPR, you have comprehensive rights over your personal data. We are committed to 
                facilitating the exercise of these rights:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {USER_RIGHTS.gdpr.map((right, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{right.right}</h3>
                      <p className="text-sm text-gray-700">{right.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* How to Exercise Rights */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Exercise Your Rights</h3>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">Contact Us</p>
                    <p className="text-sm">
                      Email us at{' '}
                      <a href={`mailto:${getContactEmail('legal')}`} className="text-blue-600 hover:underline">
                        {getContactEmail('legal')}
                      </a>
                      {' '}with your request
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">Verify Your Identity</p>
                    <p className="text-sm">
                      We may need to verify your identity to protect your data security
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">We Will Respond</p>
                    <p className="text-sm">
                      We will respond within 30 days (or 60 days for complex requests, with notification)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Transfers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              International Data Transfers
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                Your data is primarily stored in India (Supabase India Region). However, some of our 
                service providers may process data outside the EEA/UK, including in the United States.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Safeguards for International Transfers
              </h3>
              <p>
                When we transfer personal data outside the EEA/UK, we ensure appropriate safeguards are 
                in place:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Standard Contractual Clauses (SCCs):</strong> We use the European Commission-approved 
                  Standard Contractual Clauses for transfers to countries without adequacy decisions
                </li>
                <li>
                  <strong>EU-US Data Privacy Framework:</strong> Some of our processors participate in the 
                  EU-US Data Privacy Framework (e.g., certain cloud providers)
                </li>
                <li>
                  <strong>UK Extension:</strong> For UK users, we comply with the UK Extension to the EU-US 
                  Data Privacy Framework where applicable
                </li>
                <li>
                  <strong>Additional Security Measures:</strong> We implement supplementary security measures 
                  beyond SCCs, including encryption, access controls, and regular audits
                </li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Schrems II Compliance
              </h3>
              <p>
                Following the CJEU&apos;s Schrems II decision, we have:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Assessed the laws of countries to which we transfer data</li>
                <li>Implemented supplementary measures where necessary</li>
                <li>Prioritized data storage in the EEA/India where possible</li>
                <li>Obtained ISO 27001 and SOC 2 certifications for our key processors</li>
              </ul>
            </div>
          </section>

          {/* Data Management & Opt-Out */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Management Controls</h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                Providing you with control over our collection, retention, and usage of your data is a 
                key component of GDPR compliance. The following methods describe the controls available:
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Opt-Out by Default</h3>
                <p className="text-gray-700">
                  Visitors to {COMPANY_INFO.displayName} from the EU/EEA/UK are opted out of marketing 
                  communications by default. You must explicitly opt-in to receive promotional emails.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Self-Service Opt-Out</h3>
                <p className="text-gray-700">
                  To manage your communication preferences, you can use the unsubscribe link in any email 
                  or update your preferences in your account settings.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Cookie Control</h3>
                <p className="text-gray-700 mb-3">
                  You can manage your cookie preferences at any time. View our complete{' '}
                  <Link href="/trust/privacy#cookies" className="text-blue-600 hover:underline">
                    Cookie Policy
                  </Link>
                  {' '}for details.
                </p>
                <p className="text-sm text-gray-600">
                  To opt out of Google Analytics tracking, visit{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google&apos;s opt-out page
                  </a>.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Account & Data Deletion</h3>
                <p className="text-gray-700">
                  You can request complete account and data deletion at any time by contacting{' '}
                  <a href={`mailto:${getContactEmail('legal')}`} className="text-blue-600 hover:underline">
                    {getContactEmail('legal')}
                  </a>. 
                  We will delete your data within 30 days, except where legally required to retain certain records.
                </p>
              </div>
            </div>
          </section>

          {/* Data Breach Notification */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-600" />
              Data Breach Notification
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                We have established procedures to detect, report, and investigate any personal data breach. 
                In compliance with GDPR Article 33 and 34:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Authority Notification:</strong> We will notify the relevant supervisory authority 
                  within 72 hours of becoming aware of a personal data breach, unless the breach is unlikely 
                  to result in a risk to your rights and freedoms
                </li>
                <li>
                  <strong>Individual Notification:</strong> If the breach is likely to result in a high risk 
                  to your rights and freedoms, we will notify you directly without undue delay
                </li>
                <li>
                  <strong>Breach Information:</strong> Notifications will include the nature of the breach, 
                  likely consequences, and measures taken to address it
                </li>
                <li>
                  <strong>Security Measures:</strong> We maintain comprehensive incident response procedures 
                  and regular security testing to minimize breach risks
                </li>
              </ul>
            </div>
          </section>

          {/* Supervisory Authority */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Supervisory Authority & Complaints
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <p>
                Under GDPR, you have the right to lodge a complaint with a supervisory authority if you 
                believe we have violated your data protection rights. While we hope to resolve any concerns 
                directly with you, you can contact:
              </p>
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200 my-6">
                <h3 className="font-semibold text-gray-900 mb-3">EU Data Protection Authorities</h3>
                <p className="text-gray-700 mb-2">
                  Find your local data protection authority:{' '}
                  <a
                    href="https://edpb.europa.eu/about-edpb/board/members_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    EDPB Member List
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200 my-6">
                <h3 className="font-semibold text-gray-900 mb-3">UK Information Commissioner&apos;s Office (ICO)</h3>
                <p className="text-gray-700 mb-2">
                  For UK residents:{' '}
                  <a
                    href="https://ico.org.uk/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    ico.org.uk
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Areas of Investment */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our GDPR Compliance Investments
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                We&apos;ve invested significantly in the following areas to ensure GDPR compliance:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Security Infrastructure</p>
                  <p className="text-sm text-gray-700">Continuous improvements to encryption, access controls, and monitoring</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Breach Notification</p>
                  <p className="text-sm text-gray-700">Documented procedures for detecting and reporting breaches within 72 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Security Testing</p>
                  <p className="text-sm text-gray-700">Annual penetration testing and vulnerability assessments</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Contractual Terms</p>
                  <p className="text-sm text-gray-700">Updated terms of service and DPAs with GDPR-compliant provisions</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Data Management</p>
                  <p className="text-sm text-gray-700">User-friendly tools for accessing, correcting, and deleting personal data</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Staff Training</p>
                  <p className="text-sm text-gray-700">Regular GDPR training for all team members handling personal data</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">GDPR Inquiries</h2>
            <div className="prose prose-gray max-w-none text-gray-700 mb-6">
              <p>
                Please contact us if you have any questions about how we comply with GDPR or if you wish 
                to exercise your data subject rights.
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
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
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`mailto:${getContactEmail('legal')}?subject=GDPR Inquiry`}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Contact Us
                </a>
                <Link
                  href="/trust/privacy"
                  className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors border border-purple-200"
                >
                  <FileCheck className="w-5 h-5" />
                  View Privacy Policy
                </Link>
              </div>
            </div>
          </section>

          {/* Additional Resources */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="/trust/privacy"
                className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 border border-blue-200 transition-colors"
              >
                <FileCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Privacy Notice</p>
                  <p className="text-sm text-gray-600">Complete privacy policy</p>
                </div>
              </a>
              <a
                href="/terms-of-service"
                className="flex items-center gap-3 bg-green-50 hover:bg-green-100 rounded-lg p-4 border border-green-200 transition-colors"
              >
                <FileCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Terms of Service</p>
                  <p className="text-sm text-gray-600">Service agreement details</p>
                </div>
              </a>
              <a
                href="https://gdpr.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-purple-50 hover:bg-purple-100 rounded-lg p-4 border border-purple-200 transition-colors"
              >
                <Globe className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Official GDPR Website</p>
                  <p className="text-sm text-gray-600">Full text and resources</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://edpb.europa.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-orange-50 hover:bg-orange-100 rounded-lg p-4 border border-orange-200 transition-colors"
              >
                <Shield className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">European Data Protection Board</p>
                  <p className="text-sm text-gray-600">GDPR guidelines and decisions</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </section>

        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/trust/privacy"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-use"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            Terms of Use
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
