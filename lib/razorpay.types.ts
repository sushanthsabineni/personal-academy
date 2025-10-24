// Razorpay TypeScript declarations
export {}

declare global {
  interface Window {
    Razorpay: {
      new (options: RazorpayOptions): RazorpayInstance
    }
  }
}

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  image?: string
  order_id?: string
  handler?: (response: RazorpaySuccessResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
    escape?: boolean
    backdropclose?: boolean
  }
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_signature?: string
}

export interface RazorpayInstance {
  open: () => void
  on: (event: string, callback: (response: RazorpaySuccessResponse) => void) => void
}

export interface PricingTier {
  name: string
  credits: number
  storyboards: number
  prices: {
    INR: number
    USD: number
    GBP: number
    AUD: number
  }
  savings: number
  features: string[]
  highlighted: boolean
}
