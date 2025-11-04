import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check if user is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || !(profile as any).is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { to, subject, html } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Email address, subject, and body are required' },
        { status: 400 }
      )
    }

    // TODO: Integrate with your email service provider
    // Examples: SendGrid, Mailgun, Amazon SES, Resend, etc.
    
    // For now, log the email that would be sent
    console.log('Email to send:', {
      to,
      subject,
      html,
    })

    // Example with Resend (uncomment and add your API key to .env.local):
    /*
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Personal Academy <notifications@yourdomain.com>',
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to send email: ${error.message}`)
    }
    */

    // For development, return success
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully (mock)',
      to,
      subject,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
