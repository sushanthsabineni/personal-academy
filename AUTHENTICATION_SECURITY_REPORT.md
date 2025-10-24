# Authentication Security Report - Phase 4.3

**Generated:** Phase 4.3 - Authentication Security Audit  
**Status:** ⚠️ **INSECURE** - Mock implementation for prototype only  
**Risk Level:** 🔴 **HIGH** (Do NOT use in production)

---

## Executive Summary

The application currently uses a **mock authentication system** with localStorage tokens for prototype/demo purposes. This implementation is **NOT secure** and must be completely replaced before production deployment.

### Critical Security Issues

- 🔴 **CRITICAL:** Auth tokens stored in localStorage (vulnerable to XSS)
- 🔴 **CRITICAL:** No password hashing or validation
- 🔴 **CRITICAL:** Mock tokens with predictable format (`mock-auth-token-{timestamp}`)
- 🔴 **CRITICAL:** No session management or token expiration
- 🔴 **CRITICAL:** No CSRF protection
- 🔴 **HIGH:** Google OAuth client ID exposed (development credential)
- 🔴 **HIGH:** No multi-factor authentication (MFA)
- 🟡 **MEDIUM:** No account lockout after failed login attempts
- 🟡 **MEDIUM:** User info stored in localStorage (no encryption)

---

## Current Implementation Analysis

### 1. Authentication Flow (`lib/auth.ts`)

**Current Code:**
```typescript
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  const authToken = localStorage.getItem('authToken')
  return authToken !== null && authToken !== ''
}

export const login = (token: string, userInfo?: UserInfo) => {
  localStorage.setItem('authToken', token)
  if (userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  }
}

export const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('isPremium')
  sessionStorage.clear()
}
```

**Security Issues:**

1. **localStorage XSS Vulnerability**
   - Tokens stored in localStorage are accessible via JavaScript
   - Any XSS vulnerability exposes all user tokens
   - No HttpOnly cookie protection

2. **No Token Validation**
   - No signature verification
   - No expiration check
   - No server-side validation

3. **No Session Management**
   - Tokens never expire (stay valid forever)
   - No refresh token mechanism
   - No concurrent session limit

---

### 2. Login Page (`app/login/page.tsx`)

**Current Code:**
```typescript
const handleSignIn = () => {
  setIsLoading(true)
  setTimeout(() => {
    login('mock-auth-token-' + Date.now(), {
      name: email.split('@')[0] || 'User',
      email: email,
      picture: '',
      authProvider: 'email'
    })
    setIsLoading(false)
    router.push('/dashboard')
  }, 1000)
}
```

**Security Issues:**

1. **No Password Validation**
   - Password field exists but is never checked
   - Any email grants access
   - No bcrypt/argon2 hashing

2. **Predictable Token Format**
   - Format: `mock-auth-token-{timestamp}`
   - Easily guessable
   - No cryptographic randomness

3. **No Rate Limiting**
   - Unlimited login attempts
   - No brute-force protection
   - No CAPTCHA

4. **Client-Side Only**
   - No server verification
   - All logic in browser
   - Trivial to bypass

---

### 3. Google OAuth (`lib/google-auth.ts`)

**Current Code:**
```typescript
export const GOOGLE_CLIENT_ID = '1086994901085-9g1tr8ldp3l0hfqnhvcub5t7egkf3gfr.apps.googleusercontent.com'

export const decodeJWT = (token: string): GoogleUserInfo | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}
```

**Security Issues:**

1. **Hardcoded Client ID**
   - Exposed in source code
   - Should be in environment variables
   - Using development credential

2. **JWT Decoded Client-Side**
   - No signature verification
   - Trusts all JWTs without validation
   - Should verify with Google's public keys

3. **No State Parameter**
   - Vulnerable to CSRF attacks
   - Google OAuth should use state parameter
   - No nonce validation

---

## Production Authentication Requirements

### Must-Have Security Features

#### 1. Secure Token Storage

**Replace localStorage with HTTP-only Cookies:**

```typescript
// app/api/auth/login/route.ts (FUTURE)
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  
  // Validate credentials (bcrypt comparison)
  const user = await validateCredentials(email, password)
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  
  // Create secure JWT
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!))
  
  // Set HTTP-only cookie
  cookies().set('authToken', token, {
    httpOnly: true,      // Cannot access via JavaScript (prevents XSS)
    secure: true,        // Only over HTTPS
    sameSite: 'lax',     // CSRF protection
    maxAge: 3600,        // 1 hour
    path: '/'
  })
  
  return NextResponse.json({ success: true })
}
```

**Benefits:**
- ✅ Protected from XSS attacks (no JavaScript access)
- ✅ Secure flag ensures HTTPS only
- ✅ SameSite prevents CSRF
- ✅ MaxAge provides auto-expiration

---

#### 2. Password Security

**Use bcrypt for Password Hashing:**

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

```typescript
// lib/passwordUtils.ts
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  // 12 rounds = ~250ms per hash (balance security vs performance)
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return { valid: errors.length === 0, errors }
}
```

**Usage:**
```typescript
// Registration
const hashedPassword = await hashPassword(userPassword)
await db.users.create({ email, password: hashedPassword })

// Login
const user = await db.users.findByEmail(email)
const isValid = await verifyPassword(userPassword, user.password)
```

---

#### 3. Session Management

**Implement JWT with Refresh Tokens:**

```typescript
// lib/sessionUtils.ts
import { SignJWT, jwtVerify } from 'jose'

const ACCESS_TOKEN_EXPIRY = '15m'   // Short-lived
const REFRESH_TOKEN_EXPIRY = '7d'   // Long-lived

export async function createAccessToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET!))
}

export async function createRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!))
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    )
    return payload
  } catch {
    return null
  }
}

// Store refresh tokens in database
export async function storeRefreshToken(userId: string, token: string) {
  await db.refreshTokens.create({
    userId,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  })
}

// Revoke token on logout
export async function revokeRefreshToken(token: string) {
  await db.refreshTokens.delete({ token })
}
```

---

#### 4. Rate Limiting & Brute Force Protection

**Implement Login Attempt Limits:**

```typescript
// lib/rateLimiting.ts
interface LoginAttempt {
  count: number
  lockedUntil?: Date
}

const loginAttempts = new Map<string, LoginAttempt>()

export function checkLoginAttempts(identifier: string): { allowed: boolean; remainingAttempts?: number; lockedUntil?: Date } {
  const attempt = loginAttempts.get(identifier)
  
  if (!attempt) {
    return { allowed: true, remainingAttempts: 5 }
  }
  
  // Check if account is locked
  if (attempt.lockedUntil && new Date() < attempt.lockedUntil) {
    return { allowed: false, lockedUntil: attempt.lockedUntil }
  }
  
  // Reset if lock expired
  if (attempt.lockedUntil && new Date() >= attempt.lockedUntil) {
    loginAttempts.delete(identifier)
    return { allowed: true, remainingAttempts: 5 }
  }
  
  // Check remaining attempts
  if (attempt.count >= 5) {
    const lockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    loginAttempts.set(identifier, { count: attempt.count, lockedUntil })
    return { allowed: false, lockedUntil }
  }
  
  return { allowed: true, remainingAttempts: 5 - attempt.count }
}

export function recordFailedLogin(identifier: string) {
  const attempt = loginAttempts.get(identifier) || { count: 0 }
  attempt.count++
  loginAttempts.set(identifier, attempt)
}

export function resetLoginAttempts(identifier: string) {
  loginAttempts.delete(identifier)
}
```

**Usage in API Route:**
```typescript
export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  
  // Check rate limit
  const rateCheck = checkLoginAttempts(email)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Account locked until ${rateCheck.lockedUntil?.toISOString()}` },
      { status: 429 }
    )
  }
  
  // Validate credentials
  const user = await validateCredentials(email, password)
  if (!user) {
    recordFailedLogin(email)
    return NextResponse.json(
      { error: 'Invalid credentials', remainingAttempts: rateCheck.remainingAttempts! - 1 },
      { status: 401 }
    )
  }
  
  // Success - reset attempts
  resetLoginAttempts(email)
  // ... create session
}
```

---

#### 5. Google OAuth Security

**Proper OAuth Implementation:**

```typescript
// app/api/auth/google/route.ts
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function POST(request: NextRequest) {
  const { credential } = await request.json()
  
  try {
    // Verify token with Google's public keys
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    
    const payload = ticket.getPayload()
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    // Check if user exists or create new user
    let user = await db.users.findByEmail(payload.email!)
    if (!user) {
      user = await db.users.create({
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture!,
        authProvider: 'google',
        emailVerified: true // Google pre-verifies emails
      })
    }
    
    // Create secure session
    const accessToken = await createAccessToken(user.id)
    const refreshToken = await createRefreshToken(user.id)
    
    // Store refresh token
    await storeRefreshToken(user.id, refreshToken)
    
    // Set HTTP-only cookies
    cookies().set('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 900 // 15 minutes
    })
    
    cookies().set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 604800 // 7 days
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }
}
```

---

#### 6. CSRF Protection

**Next.js Built-in Protection:**

Next.js automatically provides CSRF protection through:
- SameSite cookies (Lax or Strict)
- Origin header validation
- Double-submit cookie pattern

**Additional Custom Protection:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check for CSRF token on state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token')
    const csrfCookie = request.cookies.get('csrfToken')?.value
    
    if (!csrfToken || csrfToken !== csrfCookie) {
      return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 })
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

---

#### 7. Email Verification

**Prevent Fake Account Creation:**

```typescript
// app/api/auth/register/route.ts
import { randomBytes } from 'crypto'
import { sendEmail } from '@/lib/emailService'

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json()
  
  // Validate inputs (use Zod schema)
  
  // Hash password
  const hashedPassword = await hashPassword(password)
  
  // Create verification token
  const verificationToken = randomBytes(32).toString('hex')
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  
  // Create user (inactive until verified)
  await db.users.create({
    email,
    password: hashedPassword,
    name,
    emailVerified: false,
    verificationToken,
    verificationExpiry
  })
  
  // Send verification email
  await sendEmail({
    to: email,
    subject: 'Verify your Personal Academy account',
    html: `
      <p>Click the link below to verify your email:</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify?token=${verificationToken}">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    `
  })
  
  return NextResponse.json({ 
    success: true,
    message: 'Verification email sent' 
  })
}

// app/api/auth/verify/route.ts
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }
  
  const user = await db.users.findByVerificationToken(token)
  
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }
  
  if (new Date() > user.verificationExpiry) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 })
  }
  
  // Activate account
  await db.users.update(user.id, {
    emailVerified: true,
    verificationToken: null,
    verificationExpiry: null
  })
  
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?verified=true`)
}
```

---

#### 8. Multi-Factor Authentication (MFA)

**Optional but Recommended for Admin:**

```bash
npm install otplib qrcode
```

```typescript
// lib/mfaUtils.ts
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export async function generateMFASecret(email: string) {
  const secret = authenticator.generateSecret()
  const otpauth = authenticator.keyuri(email, 'Personal Academy', secret)
  const qrCode = await QRCode.toDataURL(otpauth)
  
  return { secret, qrCode }
}

export function verifyMFAToken(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret })
}

// Usage in login flow
export async function POST(request: NextRequest) {
  const { email, password, mfaToken } = await request.json()
  
  const user = await validateCredentials(email, password)
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  
  // Check if MFA enabled
  if (user.mfaEnabled) {
    if (!mfaToken) {
      return NextResponse.json({ 
        requiresMFA: true,
        message: 'Enter your 6-digit code' 
      }, { status: 200 })
    }
    
    const isValidMFA = verifyMFAToken(mfaToken, user.mfaSecret)
    if (!isValidMFA) {
      return NextResponse.json({ error: 'Invalid MFA code' }, { status: 401 })
    }
  }
  
  // Create session...
}
```

---

## Recommended Auth Solutions

### Option 1: NextAuth.js (Recommended)

**Pros:**
- Built specifically for Next.js
- Supports multiple providers (Google, GitHub, Email, etc.)
- Built-in session management
- Database adapters for Prisma, Supabase, etc.
- Free and open-source

**Installation:**
```bash
npm install next-auth @auth/prisma-adapter
```

**Example Setup:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email }
        })
        
        if (!user || !credentials?.password) {
          return null
        }
        
        const isValid = await verifyPassword(credentials.password, user.password)
        if (!isValid) {
          return null
        }
        
        return { id: user.id, email: user.email, name: user.name }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }
```

---

### Option 2: Supabase Auth

**Pros:**
- Includes database and authentication
- Row-level security (RLS)
- Email verification built-in
- Social OAuth providers
- Realtime subscriptions

**Installation:**
```bash
npm install @supabase/supabase-js
```

**Example:**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Usage
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123!'
})

const { data: session } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123!'
})

await supabase.auth.signOut()
```

---

### Option 3: Auth0

**Pros:**
- Enterprise-grade security
- Advanced features (MFA, anomaly detection)
- Extensive documentation
- Compliance certifications (SOC2, GDPR)

**Cons:**
- Paid service after free tier
- More complex setup

---

## Security Checklist

### Before Production Launch:

#### Authentication:
- [ ] Replace mock auth with NextAuth.js or Supabase Auth
- [ ] Use HTTP-only cookies for tokens (not localStorage)
- [ ] Implement JWT with short expiration (15 minutes)
- [ ] Add refresh token mechanism
- [ ] Hash passwords with bcrypt (12+ rounds)
- [ ] Enforce strong password requirements (12+ chars, mixed case, numbers, symbols)
- [ ] Add email verification for new accounts
- [ ] Implement password reset with time-limited tokens
- [ ] Move Google OAuth credentials to environment variables
- [ ] Verify OAuth tokens server-side

#### Session Management:
- [ ] Set secure, HTTP-only, SameSite cookies
- [ ] Implement session expiration (15-60 minutes)
- [ ] Add "Remember Me" option with secure refresh tokens
- [ ] Store refresh tokens in database (allow revocation)
- [ ] Implement logout functionality (clear cookies + revoke refresh token)
- [ ] Add concurrent session limits (max 5 devices)

#### Brute Force Protection:
- [ ] Implement login rate limiting (5 attempts per 15 minutes)
- [ ] Add account lockout after failed attempts
- [ ] Log failed login attempts for monitoring
- [ ] Add CAPTCHA after 3 failed attempts
- [ ] Implement IP-based rate limiting

#### CSRF Protection:
- [ ] Enable SameSite cookies (Lax or Strict)
- [ ] Validate Origin/Referer headers
- [ ] Implement CSRF tokens for state-changing requests

#### Additional Security:
- [ ] Add MFA for admin accounts (TOTP)
- [ ] Implement security headers (CSP, X-Frame-Options, etc.)
- [ ] Log authentication events (login, logout, password change)
- [ ] Add security audit trail
- [ ] Implement "New device" email notifications
- [ ] Add "Recently used devices" view in settings
- [ ] Periodic password rotation reminders
- [ ] Detect and prevent credential stuffing attacks

---

## Testing Authentication

### Manual Tests:

1. **Login Flow:**
   - [ ] Valid credentials grant access
   - [ ] Invalid credentials show error
   - [ ] Empty fields show validation errors
   - [ ] Rate limiting works after 5 attempts
   - [ ] Account locks after failed attempts
   - [ ] Email verification required for new accounts

2. **Session Management:**
   - [ ] Tokens expire after configured time
   - [ ] Refresh token extends session
   - [ ] Logout clears all tokens
   - [ ] Concurrent sessions work independently
   - [ ] Old tokens rejected after password change

3. **Security:**
   - [ ] XSS attacks don't steal tokens (HTTP-only cookies)
   - [ ] CSRF attacks blocked by SameSite cookies
   - [ ] SQL injection attempts fail (parameterized queries)
   - [ ] Brute force attacks trigger lockout
   - [ ] JWT signature tampering rejected

### Automated Tests:

```typescript
// tests/auth.test.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })
  
  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
  
  test('should lock account after 5 failed attempts', async ({ page }) => {
    await page.goto('/login')
    for (let i = 0; i < 5; i++) {
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(500)
    }
    await expect(page.locator('text=Account locked')).toBeVisible()
  })
  
  test('should logout successfully', async ({ page, context }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'SecurePass123!')
    await page.click('button[type="submit"]')
    
    // Logout
    await page.click('button[aria-label="User menu"]')
    await page.click('text=Logout')
    
    // Verify cookies cleared
    const cookies = await context.cookies()
    expect(cookies.find(c => c.name === 'authToken')).toBeUndefined()
    
    // Verify redirected to login
    await expect(page).toHaveURL('/login')
  })
})
```

---

## Estimated Implementation Time

**Full Production Authentication Implementation:**
- NextAuth.js setup: 6-8 hours
- Database schema (Prisma/Supabase): 3-4 hours
- Password hashing & validation: 2-3 hours
- Email verification flow: 4-5 hours
- Rate limiting & lockout: 3-4 hours
- Session management & refresh tokens: 4-5 hours
- Google OAuth integration: 2-3 hours
- MFA (optional): 6-8 hours
- Testing & debugging: 8-10 hours

**Total:** ~40-50 hours (1-1.5 weeks for one developer)

---

## Conclusion

**Current Status:** 🔴 **UNSUITABLE FOR PRODUCTION**

The current authentication system is a **development prototype only** and must be replaced before any production deployment. Using mock tokens and localStorage storage presents critical security vulnerabilities.

**Recommended Action:** Implement NextAuth.js with Supabase database for secure, production-ready authentication.

**Priority:** 🔴 **CRITICAL** - Do not deploy to production without addressing these issues.

---

**Next Phase:** 4.4 - Content Security Policy (CSP) Headers
