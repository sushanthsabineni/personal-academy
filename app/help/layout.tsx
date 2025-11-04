import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers to common questions and learn how to make the most of Personal Academy.',
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
