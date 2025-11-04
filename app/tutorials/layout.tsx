import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tutorials',
  description: 'Learn how to create amazing courses with Personal Academy video tutorials and guides.',
}

export default function TutorialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
