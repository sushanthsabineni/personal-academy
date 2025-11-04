import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Course',
  description: 'Create your next professional e-learning course with AI-powered tools and templates.',
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
