"use client";

// Next.js
import Link from "next/link";
import Image from "next/image";

// Internal utilities
import { COMPANY_INFO } from "@/lib/legalContent";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Logo and Description */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Image 
                src="/logo.webp"
                alt="Personal Academy"
                width={160}
                height={160}
                className="h-12 w-auto object-contain"
                style={{ height: 'auto' }}
              />
            </div>
            <p className="text-sm text-gray-400">
              AI-powered course generation platform helping educators create engaging learning content effortlessly.
            </p>
          </div>

          {/* Column 2: AI Course Generator Links */}
          <div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-brand-teal transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: FAQ Links */}
          <div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq" className="hover:text-brand-teal transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-brand-teal transition-colors">
                  Pricing Plan
                </Link>
              </li>
              <li>
                <Link href="/refer" className="hover:text-brand-teal transition-colors">
                  Refer and Earn
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Privacy & Legal Links */}
          <div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/trust/privacy" className="hover:text-brand-teal transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/trust/gdpr" className="hover:text-brand-teal transition-colors">
                  GDPR
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="hover:text-brand-teal transition-colors">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-brand-teal transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} {COMPANY_INFO.legalName}. All rights reserved.
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms-of-service" className="text-gray-400 hover:text-brand-teal transition-colors">
                Terms
              </Link>
              <Link href="/trust/privacy" className="text-gray-400 hover:text-brand-teal transition-colors">
                Privacy
              </Link>
              <Link href="/faq" className="text-gray-400 hover:text-brand-teal transition-colors">
                FAQ
              </Link>
              <Link href="/support" className="text-gray-400 hover:text-brand-teal transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
