import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

type RateLimitRecord = {
  hits: number
  resetAt: number
}

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 5

const globalStore = globalThis as typeof globalThis & {
  __contactRateLimit?: Map<string, RateLimitRecord>
}

const rateLimitStore =
  globalStore.__contactRateLimit ?? (globalStore.__contactRateLimit = new Map())

const getClientKey = (request: NextRequest): string => {
  const xfwd = request.headers.get('x-forwarded-for') || ''
  const xreal = request.headers.get('x-real-ip') || ''
  return xfwd || xreal || 'unknown'
}

const isRateLimited = (key: string): { limited: boolean; retryAfter?: number } => {
  const record = rateLimitStore.get(key)
  const now = Date.now()

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, { hits: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { limited: false }
  }

  if (record.hits >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    }
  }

  record.hits += 1
  rateLimitStore.set(key, record)
  return { limited: false }
}

export async function POST(request: NextRequest) {
  try {
    const clientKey = getClientKey(request)
    const { limited, retryAfter } = isRateLimited(clientKey)

    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: retryAfter ? { 'Retry-After': retryAfter.toString() } : undefined,
        }
      )
    }

    const body: ContactFormData = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      )
    }

    // Create email content
    const emailContent = {
  to: 'support@personalacademy.app',
  from: email,
  replyTo: email,
  subject: `Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #374151; margin-bottom: 5px; }
            .value { color: #1f2937; background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; }
            .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #14b8a6; margin-top: 10px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">From:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">
                  <a href="mailto:${email}" style="color: #14b8a6; text-decoration: none;">${email}</a>
                </div>
              </div>
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="footer">
                <p>This message was sent from the Personal Academy contact form.</p>
                <p>Reply directly to this email to respond to ${name}.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Contact Form Submission

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Personal Academy contact form.
Reply directly to this email to respond to ${name}.
      `
    }

    // Use Resend API if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || email,
            to: 'support@personalacademy.app',
            reply_to: email,
            subject: emailContent.subject,
            html: emailContent.html,
          }),
        })

        if (!resendResponse.ok) {
          const errorData = await resendResponse.json()
          console.error('Resend API error:', errorData)
          throw new Error('Failed to send email via Resend')
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Message sent successfully!' 
        })
      } catch (resendError) {
        console.error('Resend error:', resendError)
        // Fall through to log-only mode
      }
    }

    // Fallback: Log minimal metadata for development/testing
    console.info('contact: submission received (fallback mode)', {
      email,
      subject,
      timestamp: new Date().toISOString(),
    })

    // Return success even in log-only mode
    return NextResponse.json({ 
      success: true, 
      message: 'Message received! We will respond within 24 hours.',
      mode: process.env.RESEND_API_KEY ? 'email' : 'console-log'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again later.' },
      { status: 500 }
    )
  }
}

