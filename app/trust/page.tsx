"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  FileText,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Database,
  Users,
  Mail
} from "lucide-react";
import {
  COMPANY_INFO,
  COMPLIANCE_CERTIFICATIONS,
  FAQ_TRUST_CENTER,
  RECENT_UPDATES,
  SECURITY_MEASURES,
  formatDate
} from "@/lib/legalContent";

export default function TrustCenterPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Trust Center</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your data security, privacy, and trust are our top priorities. Explore our comprehensive 
              security practices, compliance certifications, and data protection commitments.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Compliance Certifications */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Compliance & Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMPLIANCE_CERTIFICATIONS.map((cert, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{cert.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{cert.name}</h3>
                <p className="text-sm text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Access Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Explore Our Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Privacy Policy Card */}
            <Link href="/trust/privacy" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 hover:shadow-lg transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy Policy</h3>
                <p className="text-sm text-gray-700">
                  Learn how we collect, use, and protect your personal information across our platform.
                </p>
              </div>
            </Link>

            {/* GDPR Compliance Card */}
            <Link href="/trust/gdpr" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200 hover:shadow-lg transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">GDPR Compliance</h3>
                <p className="text-sm text-gray-700">
                  Our commitment to GDPR and your rights as a data subject in the European Union.
                </p>
              </div>
            </Link>

            {/* Terms of Use Card */}
            <Link href="/terms-of-use" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200 hover:shadow-lg transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Terms of Use</h3>
                <p className="text-sm text-gray-700">
                  Understand the rules and guidelines for using Personal Academy platform.
                </p>
              </div>
            </Link>

            {/* Terms of Service Card */}
            <Link href="/terms-of-service" className="group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 hover:shadow-lg transition-all h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <ExternalLink className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Terms of Service</h3>
                <p className="text-sm text-gray-700">
                  Subscription terms, credit system rules, and service-level agreements.
                </p>
              </div>
            </Link>

            {/* Security Practices Card */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Practices</h3>
              <p className="text-sm text-gray-700 mb-4">
                Industry-leading security measures protecting your data 24/7.
              </p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Regular security audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Multi-factor authentication</span>
                </li>
              </ul>
            </div>

            {/* Data Storage Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Storage</h3>
              <p className="text-sm text-gray-700 mb-4">
                Your data is securely stored in Supabase&apos;s India Region servers.
              </p>
              <ul className="space-y-1 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>India data localization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Automated backups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>99.9% uptime SLA</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security Measures */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-600" />
              Security Measures We Implement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECURITY_MEASURES.map((measure, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{measure}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Updates */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recent Updates</h2>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {RECENT_UPDATES.map((update, index) => (
                <Link
                  key={index}
                  href={update.link}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">{formatDate(update.date)}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{update.title}</h3>
                      <p className="text-gray-600">{update.description}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {FAQ_TRUST_CENTER.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 text-gray-600">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
            <Mail className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our team is here to help. Contact us for any security, privacy, or compliance inquiries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`mailto:${COMPANY_INFO.contact.legal}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Legal Team
              </a>
              <a
                href={`mailto:${COMPANY_INFO.contact.support}`}
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </a>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500">
          <p>Last Updated: {COMPANY_INFO.lastUpdated}</p>
          <p className="mt-2">
            {COMPANY_INFO.legalName} • {COMPANY_INFO.address.full}
          </p>
        </div>
      </div>
    </div>
  );
}
