import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with Personal Academy. Browse FAQs, tutorials, and contact our support team.',
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
