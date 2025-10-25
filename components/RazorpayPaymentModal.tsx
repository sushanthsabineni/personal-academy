'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, Shield, CheckCircle, AlertCircle, Loader } from '@/lib/icons'
import type { PricingTier, RazorpayOptions, RazorpaySuccessResponse } from '@/lib/razorpay.types'
import { purchaseCredits } from '@/lib/creditManagement'

interface RazorpayPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  tier: PricingTier | null
  currency: string
  userEmail?: string
  userName?: string
}

export default function RazorpayPaymentModal({
  isOpen,
  onClose,
  tier,
  currency,
  userEmail = '',
  userName = '',
}: RazorpayPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStatus('idle')
      setErrorMessage('')
      setIsProcessing(false)
    }
  }, [isOpen])

  if (!isOpen || !tier) return null

  const amount = tier.prices[currency as keyof typeof tier.prices] || tier.prices.USD
  const amountInPaise = amount * 100 // Razorpay expects amount in smallest currency unit

  const handlePayment = async () => {
    // Check if Razorpay is loaded
    if (typeof window === 'undefined' || !window.Razorpay) {
      setPaymentStatus('error')
      setErrorMessage('Payment gateway not loaded. Please refresh the page and try again.')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      console.log('💳 Creating payment order...')
      
      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          credits: tier.credits,
          tierName: tier.name,
        }),
      })

      const responseData = await orderResponse.json()
      
      console.log('📬 Order response:', { 
        ok: orderResponse.ok, 
        status: orderResponse.status,
        hasOrderId: !!responseData.orderId,
        hasKey: !!responseData.key,
        error: responseData.error 
      })

      if (!orderResponse.ok) {
        // Handle specific error cases
        if (orderResponse.status === 401) {
          setPaymentStatus('error')
          setErrorMessage('Please log in to make a purchase.')
          setIsProcessing(false)
          return
        }
        
        if (orderResponse.status === 500 && responseData.error?.includes('not configured')) {
          setPaymentStatus('error')
          setErrorMessage('Payment system is being configured. Please try again later or contact support.')
          setIsProcessing(false)
          return
        }
        
        throw new Error(responseData.error || 'Failed to create payment order')
      }

      const { orderId, key } = responseData

      if (!orderId || !key) {
        throw new Error('Invalid order response - missing order ID or key')
      }

      console.log('✅ Order created:', orderId)

      // Razorpay checkout options
      const options: RazorpayOptions = {
        key: key,
        amount: amountInPaise,
        currency,
        name: 'Personal Academy',
        description: `${tier.credits} Credits - ${tier.name} Plan`,
        image: '/logo.png?v=2',
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        notes: {
          credits: tier.credits.toString(),
          tier: tier.name,
        },
        theme: {
          color: '#14b8a6', // brand-teal
        },
        handler: async (response: RazorpaySuccessResponse) => {
          // Payment successful, verify on backend
          console.log('✅ Payment successful, verifying...')
          await verifyPayment(response, orderId)
        },
        modal: {
          ondismiss: () => {
            console.log('❌ Payment modal dismissed')
            setIsProcessing(false)
          },
          escape: true,
          backdropclose: true,
        },
      }

      console.log('🚀 Opening Razorpay checkout...')
      const razorpay = new window.Razorpay(options)
      
      razorpay.on('payment.failed', (response: RazorpaySuccessResponse) => {
        setIsProcessing(false)
        setPaymentStatus('error')
        setErrorMessage('Payment failed. Please try again.')
        console.error('❌ Payment failed:', response)
      })

      razorpay.open()
    } catch (error) {
      console.error('❌ Payment error:', error)
      setIsProcessing(false)
      setPaymentStatus('error')
      const errorMsg = error instanceof Error ? error.message : 'Failed to initialize payment'
      setErrorMessage(errorMsg + '. Please try again or contact support.')
    }
  }

  const verifyPayment = async (response: RazorpaySuccessResponse, orderId: string) => {
    setIsProcessing(true)
    
    try {
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || orderId,
          razorpay_signature: response.razorpay_signature,
          credits: tier.credits,
          amount,
          currency,
          tierName: tier.name,
        }),
      })

      const data = await verifyResponse.json()

      if (verifyResponse.ok && data.success) {
        // Add credits to user's account (localStorage)
        if (data.addCredits && tier) {
          const success = purchaseCredits(
            tier.credits,
            `${tier.name}-plan`,
            data.paymentId
          )
          
          if (success) {
            console.log(`✅ Added ${tier.credits} credits to account`)
          }
        }
        
        setPaymentStatus('success')
        setIsProcessing(false)
        
        // Close modal after 2 seconds and redirect
        setTimeout(() => {
          onClose()
          window.location.href = '/account/credits?payment=success'
        }, 2000)
      } else {
        throw new Error(data.error || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setIsProcessing(false)
      setPaymentStatus('error')
      setErrorMessage('Payment verification failed. Please contact support with your payment ID.')
    }
  }

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      INR: '₹',
      USD: '$',
      GBP: '£',
      AUD: 'A$',
    }
    return symbols[currency] || '$'
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-teal/10 rounded-lg flex items-center justify-center">
              <CreditCard className="text-brand-teal" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {paymentStatus === 'success' ? 'Payment Successful!' : 'Complete Your Purchase'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tier.name} Plan - {tier.credits.toLocaleString()} Credits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success State */}
          {paymentStatus === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {tier.credits.toLocaleString()} credits have been added to your account.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to your credits page...
              </p>
            </div>
          )}

          {/* Error State */}
          {paymentStatus === 'error' && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {paymentStatus === 'idle' && (
            <>
              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Plan</span>
                    <span className="font-medium text-gray-900 dark:text-white">{tier.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Credits</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tier.credits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Storyboards</span>
                    <span className="font-medium text-gray-900 dark:text-white">~{tier.storyboards}</span>
                  </div>
                  {tier.savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Savings</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {tier.savings}% OFF
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-slate-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">Total Amount</span>
                      <span className="text-2xl font-bold text-brand-teal">
                        {getCurrencySymbol()}{amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Included */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What&apos;s Included</h3>
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="text-brand-teal flex-shrink-0" size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
                <Shield className="text-blue-600 dark:text-blue-400" size={20} />
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Secure payment powered by Razorpay. Your payment information is encrypted and secure.
                </p>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-brand-teal hover:bg-brand-cyan text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pay {getCurrencySymbol()}{amount.toLocaleString()}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
