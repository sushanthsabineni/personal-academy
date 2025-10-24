# Contact Form Setup Documentation

## Overview
The contact form system allows users to submit inquiries that are sent to `personalacademy1@gmail.com`. The system includes:
- Reusable `ContactForm` component with modal UI
- `/api/contact` API route for email handling
- Integration in Support, Help, and Landing pages
- Email service support (Resend recommended)

## Files Created/Modified

### 1. **components/ContactForm.tsx**
- Reusable modal contact form component
- Features:
  - Fields: Name, Email, Subject, Message
  - Real-time validation (min 10 characters for message)
  - Loading and success/error states
  - Beautiful UI with dark mode support
  - Accessible (keyboard navigation, ARIA labels)
  - Auto-closes after successful submission

### 2. **app/api/contact/route.ts**
- POST endpoint that receives form submissions
- Validation:
  - All fields required
  - Email format validation
  - Message minimum length (10 characters)
- Email sending:
  - **Primary**: Resend API (if `RESEND_API_KEY` configured)
  - **Fallback**: Console logging (for development)
- Professional HTML email template with styling
- Returns appropriate error/success responses

### 3. **app/support/page.tsx**
- Replaced inline form with reusable `ContactForm` component
- Cleaner code, consistent UI
- Removed redundant state management

### 4. **app/help/page.tsx**
- Added contact form integration
- "Contact Support" button opens modal
- Quick action card triggers form

### 5. **app/page.tsx** (Landing Page)
- Added floating contact button (bottom-right corner)
- Tooltip on hover: "Contact Us"
- Integrates ContactForm modal

### 6. **.env.local.example**
- Added email service configuration examples
- Environment variables documented

## Email Service Setup

### Option 1: Resend (Recommended) ⭐

Resend is a modern email API built for developers, with excellent Next.js support.

**Steps:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use test domain for development)
3. Get your API key from dashboard
4. Add to `.env.local`:
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

**Pricing:**
- Free tier: 100 emails/day
- Pay-as-you-go: $0.001/email after free tier

**Advantages:**
- Simple integration
- Fast delivery
- Good documentation
- Built-in analytics
- No SMTP configuration needed

### Option 2: Nodemailer with Gmail

For Gmail or custom SMTP servers.

**Steps:**
1. Install nodemailer:
   ```bash
   npm install nodemailer
   ```

2. For Gmail:
   - Enable 2FA on your Google account
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Add to `.env.local`:
     ```bash
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     ```

3. Update `app/api/contact/route.ts` to use nodemailer:
   ```typescript
   import nodemailer from 'nodemailer'
   
   const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST,
     port: parseInt(process.env.SMTP_PORT || '587'),
     secure: false,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS,
     },
   })
   
   await transporter.sendMail({
     from: process.env.SMTP_USER,
     to: 'personalacademy1@gmail.com',
     replyTo: email,
     subject: emailContent.subject,
     html: emailContent.html,
     text: emailContent.text,
   })
   ```

### Option 3: SendGrid

Alternative commercial email service.

**Steps:**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get API key
3. Install: `npm install @sendgrid/mail`
4. Similar integration to Resend

## Current Behavior (Without Email Service)

If no email service is configured, the API still works:
- Form submissions are logged to console
- Success message returned to user
- Useful for development/testing
- Console output includes: name, email, subject, message, timestamp

## Testing the Contact Form

### Local Testing (Console Mode)
1. Start dev server: `npm run dev`
2. Navigate to any page with contact form
3. Fill out and submit form
4. Check terminal console for logged submission
5. User sees success message

### Production Testing (With Resend)
1. Set up Resend account and add API key
2. Build and deploy: `npm run build && npm start`
3. Submit test form
4. Check `personalacademy1@gmail.com` inbox
5. Verify email formatting and reply-to address

## Email Template Features

The HTML email template includes:
- **Header**: Branded gradient with emoji icon
- **Content Sections**:
  - From: Sender name
  - Email: Clickable mailto link
  - Subject: Message subject
  - Message: Formatted message box
- **Footer**: Instructions to reply directly
- **Styling**: Responsive, professional design
- **Plain Text**: Fallback for email clients without HTML support

## Security Considerations

✅ **Implemented:**
- Server-side validation (email format, required fields, message length)
- No CORS issues (same-origin API route)
- Rate limiting recommended (not yet implemented)
- Environment variables for sensitive keys

⚠️ **Recommended Additions:**
- Rate limiting (e.g., 5 submissions per IP per hour)
- CAPTCHA for spam prevention (hCaptcha/reCAPTCHA)
- Email queue for high volume (Bull/BullMQ)
- Monitoring/alerts for failed submissions

## Usage in Your Application

### Opening the Contact Form Programmatically

```typescript
'use client'
import { useState } from 'react'
import ContactForm from '@/components/ContactForm'

export default function YourPage() {
  const [isContactOpen, setIsContactOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setIsContactOpen(true)}>
        Contact Support
      </button>
      
      <ContactForm 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)}
        defaultSubject="Custom Subject" // Optional
      />
    </>
  )
}
```

### Props

- `isOpen`: boolean - Controls modal visibility
- `onClose`: () => void - Callback when modal closes
- `defaultSubject`: string (optional) - Pre-fills subject field

## Customization

### Changing Recipient Email
Update in `app/api/contact/route.ts`:
```typescript
to: 'newemail@example.com', // Change here
```

### Adding CC/BCC
In Resend fetch call:
```typescript
body: JSON.stringify({
  from: process.env.RESEND_FROM_EMAIL,
  to: 'personalacademy1@gmail.com',
  cc: ['manager@example.com'],
  bcc: ['archive@example.com'],
  // ... rest of email data
})
```

### Custom Email Templates
Modify the `emailContent.html` section in `app/api/contact/route.ts` to match your brand.

## Troubleshooting

### Form submits but no email received
1. Check environment variables are set correctly
2. Verify Resend API key is valid
3. Check Resend dashboard for delivery status
4. Look for errors in server logs
5. Ensure sender domain is verified in Resend

### "Network error" on submission
1. Check API route is accessible: `http://localhost:3000/api/contact`
2. Verify no CORS errors in browser console
3. Check server is running

### Emails go to spam
1. Verify your domain in Resend
2. Set up SPF, DKIM, DMARC records
3. Use professional "from" email (not noreply@gmail.com)
4. Include unsubscribe link for marketing emails

## Next Steps

1. **Set up Resend account** (5 minutes)
2. **Add environment variables** to `.env.local`
3. **Test form submission** locally
4. **Verify email delivery** to personalacademy1@gmail.com
5. **Deploy to production**
6. **Monitor usage** and add rate limiting if needed

## Support

If you encounter issues:
- Check Resend documentation: https://resend.com/docs
- Review Next.js API routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Contact form component is fully typed with TypeScript for better DX

---

**Status**: ✅ Fully implemented and ready for production with email service setup
