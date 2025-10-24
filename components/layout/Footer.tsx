"use client";

// Next.js
import Link from "next/link";

// Internal utilities
import { COMPANY_INFO } from "@/lib/legalContent";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PA</span>
              </div>
              <span className="text-white font-bold text-xl">{COMPANY_INFO.displayName}</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              AI-powered course generation platform helping educators create engaging learning content effortlessly.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/create" className="hover:text-blue-400 transition-colors">
                  AI Course Generator
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-400 transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/refer" className="hover:text-blue-400 transition-colors">
                  Referral Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-blue-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="hover:text-blue-400 transition-colors">
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Center */}
          <div>
            <h3 className="text-white font-semibold mb-4">Trust Center</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/trust" className="hover:text-blue-400 transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/trust/privacy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/trust/gdpr" className="hover:text-blue-400 transition-colors">
                  GDPR
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="hover:text-blue-400 transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} {COMPANY_INFO.legalName}. All rights reserved.
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-4 text-sm">
              <Link href="/terms-of-service" className="text-gray-400 hover:text-blue-400 transition-colors">
                Terms
              </Link>
              <Link href="/trust/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Privacy
              </Link>
              <Link href="/trust/privacy#cookies" className="text-gray-400 hover:text-blue-400 transition-colors">
                Cookie Preferences
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
