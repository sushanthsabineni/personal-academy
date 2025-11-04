'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Mail } from '@/lib/icons'

const ContactForm = dynamic(() => import('@/components/ContactForm'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-700/30 rounded-xl h-28 w-28" />
})

export default function ContactTrigger() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-teal hover:bg-brand-cyan text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center z-40 group"
        aria-label="Contact Support"
      >
        <Mail size={24} />
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Contact Us
        </span>
      </button>
      <ContactForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
