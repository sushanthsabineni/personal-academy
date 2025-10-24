# Content Security Policy Report - Phase 4.4

**Generated:** Phase 4.4 - CSP & Security Headers Audit  
**Status:** ⚠️ **MISSING** - No security headers configured  
**Risk Level:** 🟡 **MEDIUM** (Should implement before production)

---

## Executive Summary

The application currently has **NO security headers** configured in `next.config.ts`. While Next.js provides some default protections, explicit security headers significantly reduce attack surface for XSS, clickjacking, and other common web vulnerabilities.

### Missing Security Headers

- ⚠️ **No Content-Security-Policy (CSP)** - Allows inline scripts from any source
- ⚠️ **No X-Frame-Options** - Vulnerable to clickjacking attacks
- ⚠️ **No X-Content-Type-Options** - Browser can MIME-sniff responses
- ⚠️ **No Referrer-Policy** - Full referrer sent to all destinations
- ⚠️ **No Permissions-Policy** - No feature restrictions
- ⚠️ **No Strict-Transport-Security (HSTS)** - HTTP connections allowed

---

## Current Configuration Analysis

### `next.config.ts` (Current State)

```typescript
import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default withBundleAnalyzer(nextConfig);
```

**Issues:**
- No `headers()` configuration
- No security middleware
- No CSP directives
- Relying on browser defaults only

---

## Security Header Recommendations

### 1. Content Security Policy (CSP)

**Purpose:** Prevents XSS attacks by controlling which resources can be loaded and executed.

**Required Considerations for This App:**

1. **Inline Theme Script** (`app/layout.tsx` line 50)
   - Currently uses `dangerouslySetInnerHTML` for dark mode
   - Need to allow this specific inline script via nonce or hash
   - Options:
     - Option A: Use CSP nonce (dynamic, more secure)
     - Option B: Use script hash (static, simpler)
     - Option C: Move to external script file

2. **Google OAuth Script**
   - Loads from `https://accounts.google.com/gsi/client`
   - Need to whitelist Google's domain

3. **External Resources**
   - No external images currently loaded
   - No external fonts (using Next.js font optimization)
   - No analytics yet (GA4 will be added in Phase 5)

**Recommended CSP Policy:**

```typescript
// Option A: Using SHA-256 hash for theme script (simpler)
const themeScriptHash = 'sha256-[HASH_WILL_BE_CALCULATED]'

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' '${themeScriptHash}' https://accounts.google.com https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://accounts.google.com;
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://accounts.google.com https://*.supabase.co https://api.openai.com;
  frame-src 'self' https://accounts.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
```

**Directive Breakdown:**

- `default-src 'self'` - Only load resources from same origin by default
- `script-src` includes:
  - `'self'` - Allow scripts from same origin
  - `'unsafe-eval'` - Required for Next.js React Compiler (unfortunately necessary)
  - `'${themeScriptHash}'` - Allow specific inline theme script
  - `https://accounts.google.com` - Google Sign-In
  - `https://www.googletagmanager.com` - Google Analytics (Phase 5)
- `style-src 'unsafe-inline'` - Allow inline styles (React styling, Tailwind)
- `img-src` - Allow images from same origin, data URIs, HTTPS, and blobs
- `font-src` - Allow fonts from same origin and data URIs
- `connect-src` - Allow API calls to:
  - Same origin
  - Google (OAuth)
  - Supabase (database - future)
  - OpenAI (AI features - future)
- `frame-src` - Allow embedding Google OAuth iframe only
- `object-src 'none'` - Disallow plugins (Flash, etc.)
- `base-uri 'self'` - Prevent base tag injection
- `form-action 'self'` - Forms only submit to same origin
- `frame-ancestors 'none'` - Prevent embedding in iframes (clickjacking protection)
- `upgrade-insecure-requests` - Automatically upgrade HTTP to HTTPS

---

### 2. X-Frame-Options

**Purpose:** Prevents clickjacking by controlling iframe embedding.

**Recommendation:**
```
X-Frame-Options: DENY
```

Alternative if you need to embed your site in specific domains:
```
X-Frame-Options: SAMEORIGIN
```

---

### 3. X-Content-Type-Options

**Purpose:** Prevents MIME-sniffing attacks.

**Recommendation:**
```
X-Content-Type-Options: nosniff
```

Forces browser to respect declared content types.

---

### 4. Referrer-Policy

**Purpose:** Controls how much referrer information is sent.

**Recommendation:**
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Behavior:**
- Same-origin requests: Full URL sent as referrer
- Cross-origin HTTPS→HTTPS: Only origin sent
- Cross-origin HTTPS→HTTP: No referrer sent

---

### 5. Permissions-Policy (formerly Feature-Policy)

**Purpose:** Controls browser features (camera, microphone, geolocation, etc.)

**Recommendation:**
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

**Features Disabled:**
- `camera=()` - No camera access
- `microphone=()` - No microphone access
- `geolocation=()` - No location tracking
- `interest-cohort=()` - Block FLoC/Topics tracking

*Note: Enable specific features only if your app requires them*

---

### 6. Strict-Transport-Security (HSTS)

**Purpose:** Forces HTTPS connections only.

**Recommendation:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Parameters:**
- `max-age=31536000` - 1 year duration
- `includeSubDomains` - Apply to all subdomains
- `preload` - Eligible for browser preload lists

**⚠️ Important:** Only enable after confirming HTTPS works properly. Cannot be easily undone.

---

### 7. X-DNS-Prefetch-Control

**Purpose:** Controls DNS prefetching.

**Recommendation:**
```
X-DNS-Prefetch-Control: on
```

Allows browser to prefetch DNS for external domains (improves performance).

---

## Implementation Guide

### Step 1: Calculate Theme Script Hash

**Option A: Calculate SHA-256 Hash**

```bash
# Extract theme script content
# Then calculate hash
echo -n "(function() {
  const theme = localStorage.getItem('theme');
  const isDark = theme ? theme === 'dark' : true;
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();" | openssl dgst -sha256 -binary | openssl base64
```

**Result:** Will output a base64 hash like `sha256-abc123...`

**Option B: Use CSP Nonce (More Secure)**

Requires modifying `app/layout.tsx` to generate and pass nonce:

```typescript
// app/layout.tsx
import { headers } from 'next/headers'
import crypto from 'crypto'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Generate nonce for this request
  const nonce = crypto.randomBytes(16).toString('base64')
  
  return (
    <html>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                // ...theme code
              })();
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

Then in middleware, add nonce to CSP header.

**Recommended:** Use Option A (hash) for simplicity since script is static.

---

### Step 2: Add Security Headers to next.config.ts

```typescript
import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Calculate theme script hash (run command from Step 1)
const themeScriptHash = 'sha256-YOUR_CALCULATED_HASH_HERE'

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-eval' '${themeScriptHash}' https://accounts.google.com https://www.googletagmanager.com`,
              "style-src 'self' 'unsafe-inline' https://accounts.google.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://accounts.google.com https://*.supabase.co https://api.openai.com",
              "frame-src 'self' https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Only enable HSTS after confirming HTTPS works
          // {
          //   key: 'Strict-Transport-Security',
          //   value: 'max-age=31536000; includeSubDomains; preload'
          // }
        ]
      }
    ]
  }
};

export default withBundleAnalyzer(nextConfig);
```

---

### Step 3: Test CSP Implementation

**Testing Steps:**

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Open Browser DevTools (F12)**
   - Go to Console tab
   - Look for CSP violation warnings

3. **Check Network Tab:**
   - Look at response headers for any route
   - Verify all security headers are present

4. **Test Theme Script:**
   - Toggle dark/light mode
   - Verify no CSP errors in console
   - If errors occur, recalculate script hash

5. **Test Google OAuth:**
   - Click "Sign in with Google" button
   - Verify button renders (no CSP blocking `accounts.google.com`)
   - Check for frame-src or connect-src errors

6. **Test Image Loading:**
   - Verify logo and icons load correctly
   - Check for img-src violations

**Common CSP Errors & Fixes:**

| Error | Fix |
|-------|-----|
| `Refused to execute inline script` | Add correct script hash or nonce |
| `Refused to load the script 'https://...'` | Add domain to `script-src` |
| `Refused to connect to 'https://...'` | Add domain to `connect-src` |
| `Refused to load the image 'https://...'` | Add domain to `img-src` |
| `Refused to frame 'https://...'` | Add domain to `frame-src` |

---

### Step 4: Create Middleware for API-Specific Headers

**Create `middleware.ts` in project root:**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // More restrictive CSP for API routes
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'"
    )
    
    // Prevent caching of API responses with sensitive data
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    
    // Additional API security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
  }
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    // Add other routes that need custom headers
  ]
}
```

---

## CSP Report-Only Mode (Testing)

**Before enforcing CSP, test in report-only mode:**

```typescript
// next.config.ts
{
  key: 'Content-Security-Policy-Report-Only',
  value: [/* same CSP directives */].join('; ')
}
```

**Benefits:**
- Logs violations to console without blocking
- Identifies issues before enforcement
- Safe to test in production

**Switch to enforcement after confirming no violations:**
```typescript
{
  key: 'Content-Security-Policy', // Remove "-Report-Only"
  value: [/* directives */].join('; ')
}
```

---

## Security Header Testing Tools

### Online Scanners:

1. **SecurityHeaders.com**
   - URL: https://securityheaders.com
   - Grades your security headers (A-F)
   - Provides improvement recommendations

2. **Mozilla Observatory**
   - URL: https://observatory.mozilla.org
   - Comprehensive security scan
   - Checks CSP, TLS, cookies, etc.

3. **CSP Evaluator (Google)**
   - URL: https://csp-evaluator.withgoogle.com
   - Analyzes CSP policy
   - Identifies potential bypasses

### Browser Extensions:

1. **CSP Auditor** (Chrome)
   - Shows active CSP policies
   - Highlights violations in real-time

2. **Security Headers** (Firefox)
   - Displays all security headers
   - Color-coded recommendations

---

## CSP for Future Features

### When Adding Google Analytics (Phase 5):

```typescript
script-src: add 'https://www.googletagmanager.com' 'https://www.google-analytics.com'
connect-src: add 'https://www.google-analytics.com' 'https://analytics.google.com'
img-src: add 'https://www.google-analytics.com'
```

### When Adding Supabase (Phase 6):

```typescript
connect-src: add 'https://*.supabase.co' 'wss://*.supabase.co'
```

### When Adding OpenAI API:

```typescript
connect-src: add 'https://api.openai.com'
```

### When Adding Payment (Stripe):

```typescript
script-src: add 'https://js.stripe.com'
connect-src: add 'https://api.stripe.com'
frame-src: add 'https://js.stripe.com' 'https://hooks.stripe.com'
```

### When Adding External Images:

```typescript
img-src: add specific image domains instead of 'https:'
// Example: 'https://images.unsplash.com' 'https://cdn.yourdomain.com'
```

---

## Monitoring CSP Violations

### Option 1: Console Logging (Development)

Browser DevTools automatically log CSP violations.

### Option 2: Report URI (Production)

**Add reporting endpoint to CSP:**

```typescript
const cspHeader = `
  default-src 'self';
  /* ...other directives... */
  report-uri /api/csp-report;
  report-to csp-endpoint;
`
```

**Create API endpoint to receive reports:**

```typescript
// app/api/csp-report/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const report = await request.json()
  
  // Log to monitoring service (Sentry, LogRocket, etc.)
  console.error('CSP Violation:', report)
  
  // Store in database for analysis
  // await db.cspReports.create({ report, timestamp: new Date() })
  
  return NextResponse.json({ received: true }, { status: 204 })
}
```

### Option 3: Third-Party Services

**Free CSP Report Collectors:**
- **Report URI** (https://report-uri.com) - Free tier available
- **Sentry** - Captures CSP violations with full context
- **LogRocket** - Session replay with CSP tracking

---

## Performance Impact

**Security headers have minimal performance impact:**
- Headers add ~500-1000 bytes per response
- CSP parsing is negligible (<1ms)
- HSTS reduces redirects (improves performance)
- DNS prefetch can improve load times

**Trade-off:** Slight overhead for significant security improvement.

---

## Security Checklist

### Before Production:

- [ ] Calculate theme script SHA-256 hash
- [ ] Add security headers to `next.config.ts`
- [ ] Test CSP in report-only mode
- [ ] Verify no console errors or blocked resources
- [ ] Test Google OAuth with CSP active
- [ ] Test image/font loading
- [ ] Test dark mode toggle
- [ ] Enable CSP enforcement mode
- [ ] Scan with SecurityHeaders.com (target A grade)
- [ ] Scan with Mozilla Observatory (target 90+ score)
- [ ] Test with CSP Evaluator (no high-risk bypasses)
- [ ] Enable HSTS after HTTPS confirmation
- [ ] Set up CSP violation monitoring
- [ ] Document CSP policy for team

### When Deploying to Vercel/Production:

- [ ] Verify headers work on deployed site
- [ ] Check HTTPS is enforced
- [ ] Enable HSTS with preload
- [ ] Submit to HSTS preload list (hstspreload.org)
- [ ] Monitor CSP violations for 1 week
- [ ] Adjust CSP based on violations
- [ ] Re-scan with security tools

---

## Estimated Implementation Time

**Security Headers Implementation:**
- Calculate script hash: 15 minutes
- Add headers to next.config.ts: 30 minutes
- Testing in development: 1-2 hours
- CSP report-only testing: 1-2 hours
- Fix violations and enable enforcement: 1-2 hours
- Create middleware: 30 minutes
- Set up violation monitoring: 1 hour
- Security scanner testing: 1 hour

**Total:** ~6-8 hours

---

## Example: Complete Secure Configuration

```typescript
// next.config.ts (PRODUCTION READY)
import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer'
import crypto from 'crypto'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Calculate hash for theme script
function getThemeScriptHash(): string {
  const themeScript = `
    (function() {
      const theme = localStorage.getItem('theme');
      const isDark = theme ? theme === 'dark' : true;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `
  const hash = crypto.createHash('sha256').update(themeScript.trim()).digest('base64')
  return `sha256-${hash}`
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const themeScriptHash = getThemeScriptHash()
    
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          `script-src 'self' 'unsafe-eval' '${themeScriptHash}' https://accounts.google.com https://www.googletagmanager.com`,
          "style-src 'self' 'unsafe-inline' https://accounts.google.com",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://accounts.google.com https://*.supabase.co https://api.openai.com https://www.google-analytics.com",
          "frame-src 'self' https://accounts.google.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
          "report-uri /api/csp-report"
        ].join('; ')
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      }
    ]
    
    // Only add HSTS in production with HTTPS
    if (!isDevelopment && process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https')) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      })
    }
    
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
};

export default withBundleAnalyzer(nextConfig);
```

---

## Conclusion

**Current Status:** ⚠️ **NO SECURITY HEADERS** configured

**Risk Level:** 🟡 MEDIUM (not critical for static prototype, but required for production)

**Recommended Action:**
1. Implement security headers before production launch
2. Test in CSP report-only mode first
3. Monitor violations and adjust policy
4. Enable HSTS only after HTTPS confirmation

**Priority:** 🟡 HIGH - Should complete before production deployment

**Estimated Time:** 6-8 hours

---

**Phase 4 Complete!** Next: Phase 5 - Google Analytics Integration
