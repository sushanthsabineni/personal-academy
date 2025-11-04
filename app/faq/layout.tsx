import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Personal Academy features, pricing, and course creation.',
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
