import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing & Credits',
  description: 'Choose the perfect credit package for your e-learning needs. Flexible pricing for course creators.',
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
