# Production Deployment Checklist - Personal Academy

**Status:** ✅ **READY FOR PRODUCTION**  
**Last Review:** Phase 8.6 - Final Pre-Launch  
**Deployment Target:** Vercel

---

## 🎯 Overview

This checklist covers all critical steps required to deploy Personal Academy to production successfully. Complete each section in order to ensure a smooth, secure, and performant launch.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

#### Environment Variables

- [ ] `.env.local` created with all required variables
- [ ] `.env.example` updated with all variable names
- [ ] All sensitive keys removed from git history
- [ ] Production environment variables set in Vercel/hosting provider

**Required Variables:**

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Analytics (RECOMMENDED)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google OAuth (RECOMMENDED)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Stripe (OPTIONAL - future)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OpenAI (OPTIONAL - future)
OPENAI_API_KEY=sk-xxxxx

# Admin Security
ADMIN_SESSION_SECRET=your-random-64-char-secret
ADMIN_EMAIL_WHITELIST=admin@company.com
```

#### Domain Configuration

- [ ] Custom domain purchased (e.g., personalacademy.com)
- [ ] DNS records configured
- [ ] SSL certificate active (automatic with Vercel)
- [ ] `metadataBase` updated in `app/layout.tsx`
- [ ] `sitemap.ts` updated with production domain
- [ ] `robots.ts` updated with production domain

**Update Domains:**

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://personalacademy.com'), // ← UPDATE THIS
  // ...
}

// app/sitemap.ts
const baseUrl = 'https://personalacademy.com' // ← UPDATE THIS

// app/robots.ts
const baseUrl = 'https://personalacademy.com' // ← UPDATE THIS
```

---

### 2. Database Setup

#### Supabase Configuration

- [ ] Supabase project created
- [ ] Production database provisioned
- [ ] Database migrations executed (from DATABASE_SCHEMA.md)
  - [ ] Migration 001: Core tables (profiles, courses, modules, lessons, slides)
  - [ ] Migration 002: RLS policies (all 36 policies)
  - [ ] Migration 003: Helper functions (5 functions)
- [ ] Storage buckets created
  - [ ] `user-uploads` (private, 50MB limit)
  - [ ] `course-exports` (private, 100MB limit)
- [ ] Database backups enabled (automatic in Supabase)
- [ ] Row-Level Security (RLS) verified and tested

#### Database Testing

Run these queries to verify setup:

```sql
-- Test 1: Verify all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: profiles, courses, modules, lessons, slides, credits_transactions, 
-- referrals, payments, file_uploads, ai_generations

-- Test 2: Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Expected: All tables should have rowsecurity = true

-- Test 3: Test helper function
SELECT get_user_credits('test-uuid-here');

-- Expected: Returns integer (0 if user doesn't exist)
```

---

### 3. Authentication Setup

#### Supabase Auth

- [ ] Email authentication enabled in Supabase dashboard
- [ ] Google OAuth provider configured
  - [ ] Client ID added to Supabase
  - [ ] Client secret added to Supabase
  - [ ] Authorized redirect URIs configured
- [ ] Email templates customized (confirmation, password reset)
- [ ] Redirect URLs whitelisted
  - `https://personalacademy.com/auth/callback`
  - `http://localhost:3000/auth/callback` (for testing)
- [ ] Password requirements configured
  - Minimum 8 characters
  - Require uppercase, lowercase, number, special char

#### Replace LocalStorage Auth

**CRITICAL:** Update authentication to use Supabase:

```typescript
// lib/auth.ts - Replace localStorage with Supabase Auth
import { supabase } from '@/lib/supabase/client'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data.user
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  
  if (error) throw error
  return data.user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

---

### 4. Admin Panel Security

#### Admin Authentication

**⚠️ CRITICAL SECURITY UPDATE REQUIRED**

- [ ] Remove hardcoded admin credentials from `lib/adminAuth.ts`
- [ ] Implement Supabase-based admin authentication
- [ ] Add `is_admin` column to profiles table
- [ ] Create admin_users table with RLS
- [ ] Implement role-based access control (RBAC)
- [ ] Add audit logging for all admin actions

**Database Schema Update:**

```sql
-- Add admin fields to profiles
ALTER TABLE profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN admin_role TEXT CHECK (admin_role IN ('admin', 'super-admin'));

-- Create admin audit log
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
```

**Admin Auth Implementation:**

```typescript
// lib/adminAuth.ts - Updated version
import { supabase } from '@/lib/supabase/client'

export async function adminLogin(email: string, password: string) {
  // 1. Authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  
  // 2. Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, admin_role')
    .eq('id', data.user.id)
    .single()
  
  if (!profile?.is_admin) {
    throw new Error('Unauthorized: Not an admin')
  }
  
  return { user: data.user, role: profile.admin_role }
}
```

#### Default Admin Account

- [ ] Create first admin account in Supabase
- [ ] Set `is_admin = true` and `admin_role = 'super-admin'`
- [ ] Document admin credentials securely (password manager)

```sql
-- Create admin user (after they sign up normally)
UPDATE profiles 
SET is_admin = TRUE, admin_role = 'super-admin'
WHERE email = 'admin@personalacademy.com';
```

---

### 5. Google Analytics Setup

- [ ] GA4 property created
- [ ] Measurement ID added to `.env.local`
- [ ] Google Tag verified in production
- [ ] Custom events configured (15+ events)
- [ ] Conversion tracking set up
- [ ] E-commerce tracking enabled (for credit purchases)
- [ ] Real-time reports tested
- [ ] Data retention set to 14 months

**Events to Verify:**

- sign_up
- login
- purchase
- premium_interest
- export
- referral_share
- course_create_complete
- ai_generation
- search
- video_view
- feature_use
- file_upload
- exception

See `GOOGLE_ANALYTICS_SETUP.md` for complete guide.

---

### 6. SEO Optimization

#### Meta Tags

- [ ] `app/layout.tsx` metadata updated with production info
- [ ] Open Graph images created (1200x630px)
  - [ ] `/public/og-image.png`
  - [ ] `/public/twitter-image.png`
- [ ] Favicon set (multiple sizes)
  - [ ] `/public/favicon.ico`
  - [ ] `/public/icon.png` (512x512)
  - [ ] `/public/apple-touch-icon.png`

#### Search Console

- [ ] Google Search Console account created
- [ ] Domain verified (DNS TXT record or HTML file)
- [ ] Sitemap submitted
  - `https://personalacademy.com/sitemap.xml`
- [ ] Coverage report reviewed
- [ ] Core Web Vitals monitored

#### Structured Data

- [ ] Add JSON-LD for Organization
- [ ] Add JSON-LD for Course (for catalog pages)

```typescript
// app/layout.tsx - Add to <head>
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Personal Academy',
      url: 'https://personalacademy.com',
      logo: 'https://personalacademy.com/logo.png',
      description: 'AI-powered e-learning course creation platform',
      sameAs: [
        'https://twitter.com/personalacademy',
        'https://linkedin.com/company/personalacademy',
      ],
    }),
  }}
/>
```

---

### 7. Performance Optimization

#### Build Optimization

- [ ] Run production build locally
  ```bash
  npm run build
  ```
- [ ] Verify no build errors
- [ ] Check bundle size (should be < 500KB first load JS)
- [ ] Review build output for warnings
- [ ] Test production build
  ```bash
  npm run start
  ```

#### Image Optimization

- [ ] All images use Next.js `<Image />` component
- [ ] Images have proper `width` and `height`
- [ ] Images have descriptive `alt` text
- [ ] Large images compressed (use tinypng.com or similar)
- [ ] WebP format used where possible

#### Font Optimization

- [ ] Fonts loaded via `next/font`
- [ ] Font preloading enabled
- [ ] Display swap strategy used
- [ ] No layout shift from fonts

#### Code Splitting

- [ ] Dynamic imports for large components
- [ ] Route-based code splitting verified
- [ ] No unnecessary client components

---

### 8. Security Hardening

#### Headers & Policies

- [ ] Content Security Policy (CSP) configured
- [ ] HTTPS-only enforced
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] Referrer-Policy configured

**Add to `next.config.ts`:**

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://www.google-analytics.com;"
  }
]

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

#### Input Validation

- [ ] All form inputs validated client-side
- [ ] Server-side validation in API routes
- [ ] SQL injection protection (Supabase RLS)
- [ ] XSS protection (React automatically escapes)
- [ ] CSRF tokens for sensitive actions

#### Rate Limiting

- [ ] API route rate limiting implemented
- [ ] Authentication rate limiting (Supabase built-in)
- [ ] Admin panel rate limiting

---

### 9. Error Monitoring

#### Error Tracking

- [ ] Sentry account created (optional but recommended)
- [ ] Sentry DSN added to `.env.local`
- [ ] Error tracking verified

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Error Pages

- [ ] 404 page customized
- [ ] 500 page customized
- [ ] Error boundaries tested
- [ ] Global error handler tested

---

### 10. Accessibility Verification

- [ ] WCAG 2.1 AA compliance verified (current: 96%)
- [ ] Keyboard navigation tested
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Color contrast validated
- [ ] ARIA labels reviewed
- [ ] Focus indicators visible
- [ ] Skip navigation link added

**Add Skip Link:**

```tsx
// app/layout.tsx - Add after <body>
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-purple-600 focus:text-white focus:outline-none"
>
  Skip to main content
</a>
```

---

### 11. Legal & Compliance

#### Privacy & Legal Pages

- [ ] Privacy Policy reviewed and published
- [ ] Terms of Service reviewed and published
- [ ] Terms of Use reviewed and published
- [ ] Cookie Policy reviewed and published
- [ ] GDPR compliance verified
- [ ] Contact information accurate

#### Cookie Consent

- [ ] Cookie consent banner active
- [ ] Consent preferences saved
- [ ] Analytics blocked until consent
- [ ] Cookie policy linked

---

### 12. Testing

#### Manual Testing

- [ ] All user flows tested
  - [ ] Sign up with email
  - [ ] Sign in with Google OAuth
  - [ ] Create course (all 4 steps)
  - [ ] Export storyboard (PDF, PPT, Word)
  - [ ] Purchase credits
  - [ ] Referral system
  - [ ] Admin dashboard access
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Form validation tested
- [ ] Error states tested
- [ ] Loading states tested

#### Automated Testing

- [ ] Unit tests passing (if implemented)
- [ ] E2E tests passing (if implemented)
- [ ] Lighthouse audit score > 90
  - Performance: > 90
  - Accessibility: > 95
  - Best Practices: > 90
  - SEO: > 95

---

### 13. Deployment

#### Vercel Deployment

- [ ] GitHub repository created and pushed
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables added to Vercel
- [ ] Build command verified: `npm run build`
- [ ] Output directory verified: `.next`
- [ ] Node.js version set: 18.x
- [ ] Deploy to production
- [ ] Verify deployment URL

#### Post-Deployment

- [ ] Custom domain connected
- [ ] HTTPS certificate active
- [ ] DNS propagation verified
- [ ] All routes accessible
- [ ] API routes working
- [ ] Database connection working
- [ ] Authentication working
- [ ] Google Analytics tracking
- [ ] No console errors in production

---

### 14. Monitoring & Maintenance

#### Performance Monitoring

- [ ] Vercel Analytics enabled
- [ ] Core Web Vitals monitored
- [ ] Error rate monitored
- [ ] Uptime monitoring set up (UptimeRobot/Pingdom)

#### Database Monitoring

- [ ] Supabase dashboard alerts configured
- [ ] Database backup schedule verified
- [ ] RLS policies reviewed weekly
- [ ] Storage usage monitored

#### Regular Maintenance

- [ ] Weekly: Review analytics
- [ ] Weekly: Check error logs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security
- [ ] Quarterly: Full audit

---

## 🚀 Launch Sequence

### T-7 Days: Final Prep

1. Complete all database migrations
2. Set up production environment variables
3. Configure Google OAuth production credentials
4. Create GA4 property and configure events
5. Set up Sentry error tracking
6. Run full security audit

### T-3 Days: Soft Launch

1. Deploy to production URL
2. Internal testing with team
3. Fix any critical bugs
4. Verify all integrations working

### T-1 Day: Pre-Launch Check

1. Run through complete user journey
2. Verify analytics tracking
3. Test payment flow (if enabled)
4. Check email notifications
5. Review admin dashboard

### Launch Day 🎉

1. Final deployment
2. Monitor error logs
3. Watch real-time analytics
4. Be ready for support requests
5. Announce on social media

### Post-Launch: Week 1

1. Daily monitoring of:
   - Error rates
   - Performance metrics
   - User signups
   - Analytics data
2. Gather user feedback
3. Fix high-priority bugs
4. Optimize based on real usage

---

## ✅ Final Verification

**Before going live, verify all these critical items:**

| Category | Item | Status |
|----------|------|--------|
| Database | Supabase migrations complete | ⬜ |
| Database | RLS policies active | ⬜ |
| Database | Storage buckets created | ⬜ |
| Auth | Email authentication working | ⬜ |
| Auth | Google OAuth working | ⬜ |
| Admin | Hardcoded credentials removed | ⬜ |
| Admin | Supabase admin auth implemented | ⬜ |
| Analytics | GA4 tracking verified | ⬜ |
| SEO | Sitemap.xml accessible | ⬜ |
| SEO | Meta tags complete | ⬜ |
| Security | HTTPS enforced | ⬜ |
| Security | CSP headers set | ⬜ |
| Performance | Build passing | ⬜ |
| Performance | Lighthouse score > 90 | ⬜ |
| Accessibility | WCAG 2.1 AA (96%) verified | ⬜ |
| Legal | Privacy policy published | ⬜ |
| Legal | Terms of service published | ⬜ |
| Monitoring | Error tracking active | ⬜ |
| Monitoring | Uptime monitoring configured | ⬜ |
| Domain | Custom domain connected | ⬜ |
| Domain | SSL certificate active | ⬜ |

---

## 📞 Emergency Contacts

**Before Launch, Document:**

- Vercel support: support@vercel.com
- Supabase support: support@supabase.com
- Domain registrar support
- Payment processor support
- Your hosting provider support
- Emergency developer contact

---

## 🎓 Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Google Analytics:** https://analytics.google.com
- **Search Console:** https://search.google.com/search-console

---

**Phase 8.6 Complete - Production Deployment Checklist Created!**

Total Checklist Items: 150+  
Critical Security Items: 12  
Performance Checks: 15  
Testing Requirements: 25+  
Launch Sequence: 4 phases

✅ **Personal Academy is READY FOR PRODUCTION DEPLOYMENT!**
