# Admin Dashboard Documentation - Personal Academy

**Version:** 1.0  
**Status:** ✅ **FULLY FUNCTIONAL**  
**Access Level:** Super Admin

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Security](#authentication--security)
3. [Dashboard Pages](#dashboard-pages)
4. [Configuration Management](#configuration-management)
5. [User Management](#user-management)
6. [Financial Tracking](#financial-tracking)
7. [Analytics & Metrics](#analytics--metrics)
8. [Data Storage](#data-storage)
9. [Security Recommendations](#security-recommendations)
10. [Production Deployment](#production-deployment)

---

## Overview

### Architecture

The admin dashboard is a **client-side application** with the following structure:

```
app/admin/
├── login/          # Admin authentication
├── dashboard/      # Main metrics overview
├── users/          # User management
├── expenses/       # Financial expense tracking
├── config/         # Platform configuration
│   ├── ai-credits/ # AI credit rates
│   ├── pricing/    # Pricing plans
│   └── platform/   # Platform settings
└── settings/       # General admin settings

lib/
├── adminAuth.ts    # Authentication utilities
├── adminConfig.ts  # Configuration management
├── adminData.ts    # Analytics & user data
└── expenses.ts     # Expense tracking
```

### Key Features

- **📊 Real-time Metrics Dashboard** - Platform overview, revenue, users, courses
- **👥 User Management** - View, search, filter, and edit user accounts
- **💰 Financial Tracking** - Revenue analytics, expense management, profitability metrics
- **⚙️ Dynamic Configuration** - Adjust AI credit rates, pricing plans, platform settings
- **📈 Advanced Analytics** - User growth, churn rate, ROI, CAC, LTV
- **🔒 Role-Based Access** - Admin and Super-Admin roles

---

## Authentication & Security

### Current Implementation

**File:** `lib/adminAuth.ts`

#### Authentication Flow

```typescript
// Login (client-side)
adminLogin(email: string, password: string): boolean

// Check authentication
isAdmin(): boolean

// Get current admin user
getAdminUser(): AdminUser | null

// Logout
adminLogout(): void
```

#### Default Credentials

⚠️ **CRITICAL**: Change these before production deployment!

```typescript
Email: admin@personalacademy.com
Password: admin123
Role: super-admin
```

#### Security Model

- **Storage:** LocalStorage (tokens + user data)
- **Token:** `adminToken` = `admin-token-{timestamp}`
- **User Data:** JSON-serialized `AdminUser` object
- **Roles:** `admin` | `super-admin`

#### Admin User Interface

```typescript
interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super-admin'
  lastLogin?: string
}
```

---

## Dashboard Pages

### 1. Main Dashboard (`/admin/dashboard`)

**File:** `app/admin/dashboard/page.tsx`

#### Displayed Metrics

**Platform Overview:**
- Total Users (free vs premium breakdown)
- Active Users Today
- Total Revenue (lifetime, monthly, daily)
- Course Statistics

**Financial Metrics:**
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Net Profit & Profit Margin
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Return on Investment (ROI)

**AI Credits Metrics:**
- Total Credits Issued
- Total Credits Used
- Credits Remaining
- Average Credits Per User
- Cost Per Credit

**Course Statistics:**
- Total Courses Created
- Completed vs Draft Courses
- Courses This Week/Month

**Revenue Chart:**
- Last 7 days daily revenue
- Subscription counts per day

**Recent Users Table:**
- Last 5 registered users
- Name, email, signup date, status (free/premium)

#### Navigation

```tsx
// Quick action buttons
- Users Management → /admin/users
- Platform Config → /admin/settings
- Expenses Tracking → /admin/expenses
```

---

### 2. User Management (`/admin/users`)

**File:** `app/admin/users/page.tsx`

#### Features

**Search & Filter:**
- Search by name or email
- Filter by account type (All | Free | Premium)

**User Table Columns:**
- Profile Picture (avatar)
- Name & Email
- Signup Date
- Account Type (Free/Premium badge)
- Credits Balance (editable)
- Courses Created
- Last Active
- Auth Provider (Email/Google icon)

**Inline Editing:**
```tsx
// Edit credits
1. Click Edit icon next to credits
2. Enter new credit amount
3. Click Check icon to save or X to cancel
4. Updates localStorage immediately
```

#### Data Source

```typescript
// lib/adminData.ts
getAllUsers(): UserProfile[]
searchUsers(query: string): UserProfile[]
updateUserCredits(userId: string, newCredits: number): boolean
```

#### User Profile Interface

```typescript
interface UserProfile {
  id: string
  name: string
  email: string
  signupDate: string
  isPremium: boolean
  credits: number
  coursesCreated: number
  lastActive: string
  authProvider: 'email' | 'google'
  profilePicture?: string
}
```

---

### 3. Expenses Tracking (`/admin/expenses`)

**File:** `app/admin/expenses/page.tsx`

#### Features

**Summary Cards:**
- This Month Total
- Total Expenses (all time)
- Average Daily Spend
- Category breakdown

**Expense Categories:**
- AI Credits
- Tools & Subscriptions
- Marketing
- Development
- Infrastructure
- Other

**Expense Management:**
- Add New Expense (modal form)
- Edit Existing Expense (inline)
- Delete Expense (with confirmation)
- Filter by Category

**Expense Table Columns:**
- Date
- Description
- Category (colored badge)
- Amount (INR)
- Status (Paid/Pending/Recurring)
- Actions (Edit/Delete)

#### Expense Interface

```typescript
interface Expense {
  id: string
  date: string
  description: string
  amount: number
  category: ExpenseCategory
  status: 'Paid' | 'Pending' | 'Recurring'
  vendor?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

type ExpenseCategory =
  | 'AI Credits'
  | 'Tools & Subscriptions'
  | 'Marketing'
  | 'Development'
  | 'Infrastructure'
  | 'Other'
```

#### Expense Functions

```typescript
// lib/expenses.ts
getAllExpenses(): Expense[]
addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense
updateExpense(id: string, updates: Partial<Expense>): boolean
deleteExpense(id: string): boolean
getExpensesSummaryByCategory(): Record<ExpenseCategory, number>
getCurrentMonthTotalExpenses(): number
```

---

### 4. Configuration Management

#### 4.1 AI Credit Rates (`/admin/config/ai-credits`)

**File:** `app/admin/config/ai-credits/page.tsx`

**Configurable Rates:**

| Feature | Default Credits | Description |
|---------|----------------|-------------|
| Learning Outcomes | 10 | Generate course learning outcomes |
| Modules | 15 | Generate course modules with topics |
| Lessons | 20 | Generate detailed lesson content |
| Quiz Questions | 12 | Generate quiz questions & answers |
| Assessments | 18 | Generate comprehensive assessments |
| Certificates | 5 | Generate completion certificates |

**Interface:**

```typescript
interface AICreditRates {
  learningOutcomes: number
  modules: number
  lessons: number
  quiz: number
  assessments: number
  certificates: number
}
```

**Total Credits Per Course:** Sum of all rates (default: 80 credits)

**Functions:**

```typescript
getAICreditRates(): AICreditRates
updateAICreditRates(rates: AICreditRates): void
```

---

#### 4.2 Pricing Plans (`/admin/config/pricing`)

**File:** `app/admin/config/pricing/page.tsx`

**Default Plans:**

**Free Plan:**
- Price: ₹0
- Credits: 100
- Max Courses: 3
- Features: Basic templates, Email support, Community access

**Premium Plan:**
- Price: ₹4,150 (~$50 USD)
- Credits: 1,000
- Max Courses: Unlimited
- Features: Premium templates, Priority support, Advanced analytics, Custom branding, Export options

**Plan Management:**
- Edit plan name, price, credits
- Add/remove/edit features
- Mark plan as "Popular"
- Real-time preview

**Interface:**

```typescript
interface PricingPlan {
  id: string
  name: string
  price: number // in INR
  credits: number
  features: string[]
  isPopular?: boolean
}
```

**Functions:**

```typescript
getPricingPlans(): PricingPlan[]
updatePricingPlans(plans: PricingPlan[]): void
```

---

#### 4.3 Platform Settings (`/admin/config/platform`)

**File:** `app/admin/config/platform/page.tsx`

**Configurable Settings:**

| Setting | Default | Description |
|---------|---------|-------------|
| Platform Name | Personal Academy | Brand name |
| Support Email | support@personalacademy.com | Contact email |
| Currency Symbol | ₹ | Display symbol |
| Currency Code | INR | ISO code |
| Exchange Rate | 83 | USD to INR conversion |
| Max Courses Per User | 50 | Free user limit |
| Enable Referrals | true | Referral system toggle |
| Referral Credits | 50 | Bonus credits per referral |

**Interface:**

```typescript
interface PlatformSettings {
  currencySymbol: string
  currencyCode: string
  exchangeRate: number
  platformName: string
  supportEmail: string
  maxCoursesPerUser: number
  enableReferrals: boolean
  referralCredits: number
}
```

**Functions:**

```typescript
getPlatformSettings(): PlatformSettings
updatePlatformSettings(settings: PlatformSettings): void
```

---

## Analytics & Metrics

### Platform Metrics

```typescript
interface PlatformMetrics {
  totalUsers: number
  freeUsers: number
  premiumUsers: number
  activeUsersToday: number
  totalRevenue: number
  revenueThisMonth: number
  revenueToday: number
  lifetimeRevenue: number
}
```

### Financial Metrics

```typescript
interface FinancialMetrics {
  // Revenue
  totalRevenue: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  
  // Costs
  aiCreditsSpent: number
  infrastructureCost: number
  marketingSpend: number
  totalExpenses: number
  
  // Profitability
  netProfit: number
  profitMargin: number
  
  // Growth
  revenueGrowth: number
  userGrowth: number
  churnRate: number
  
  // ROI
  customerAcquisitionCost: number
  lifetimeValue: number
  returnOnInvestment: number
}
```

### AI Credits Metrics

```typescript
interface AICreditsMetrics {
  totalCreditsIssued: number
  totalCreditsUsed: number
  creditsRemaining: number
  costPerCredit: number
  totalCreditsCost: number
  averageCreditsPerUser: number
  premiumUsersCredits: number
  freeUsersCredits: number
}
```

### Data Functions

```typescript
// lib/adminData.ts

// User Analytics
getPlatformMetrics(): PlatformMetrics
getAllUsers(): UserProfile[]
searchUsers(query: string): UserProfile[]
updateUserCredits(userId: string, credits: number): boolean

// Course Analytics
getCourseStats(): CourseStats
getDailyRevenue(days: number): DailyRevenue[]

// Financial Analytics
getFinancialMetrics(): FinancialMetrics
getAICreditsMetrics(): AICreditsMetrics
```

---

## Data Storage

### Current Implementation

⚠️ **All data is stored in localStorage** (client-side only)

#### Storage Keys

```typescript
// Admin Authentication
localStorage.setItem('adminToken', 'admin-token-{timestamp}')
localStorage.setItem('adminUser', JSON.stringify(adminUser))

// Configuration
localStorage.setItem('adminConfig', JSON.stringify(config))

// Expenses
localStorage.setItem('expenses', JSON.stringify(expenses))

// Mock Users (demo data)
localStorage.setItem('mockUsers', JSON.stringify(users))
```

### Mock Data Generator

```typescript
// lib/adminData.ts
generateMockUsers(): UserProfile[]
// Creates 50 mock users with realistic data for demo purposes
```

---

## Security Recommendations

### ⚠️ CRITICAL: Production Security Checklist

#### 1. Authentication

**Current Issue:** Hardcoded credentials in client-side code

**Required Changes:**

```typescript
// ❌ DO NOT USE IN PRODUCTION
const ADMIN_CREDENTIALS = {
  email: 'admin@personalacademy.com',
  password: 'admin123',
  role: 'super-admin'
}

// ✅ REQUIRED: Move to secure backend
// Implement with Supabase Auth + Row-Level Security (RLS)
```

**Recommended Implementation:**

```typescript
// lib/supabase/adminAuth.ts
import { supabase } from '@/lib/supabase/client'

export async function adminLogin(email: string, password: string) {
  // 1. Authenticate with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  
  // 2. Check admin role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, admin_role')
    .eq('id', data.user.id)
    .single()
  
  if (!profile?.is_admin) {
    throw new Error('Unauthorized: Not an admin')
  }
  
  return {
    user: data.user,
    role: profile.admin_role
  }
}
```

#### 2. Database Schema Updates

**Add admin roles to profiles table:**

```sql
-- Migration: Add admin fields to profiles
ALTER TABLE profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN admin_role TEXT CHECK (admin_role IN ('admin', 'super-admin'));

-- Create admin users table (optional, for separation)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super-admin')),
  permissions JSONB DEFAULT '{"all": true}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- RLS policy for admin access
CREATE POLICY "Only admins can access admin_users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );
```

#### 3. API Routes for Admin Operations

**Create protected API routes:**

```typescript
// app/api/admin/users/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check admin authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  
  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Fetch all users
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ users })
}

// POST: Update user credits
export async function POST(request: Request) {
  // Similar authentication checks...
  
  const { userId, credits } = await request.json()
  
  // Update credits via RPC function
  const { error } = await supabase
    .rpc('admin_update_user_credits', {
      target_user_id: userId,
      new_credits: credits
    })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
```

#### 4. Environment Variables

**Required for production:**

```bash
# .env.local (NEVER COMMIT)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Security
ADMIN_SESSION_SECRET=random-secure-secret-key-here
ADMIN_TOKEN_EXPIRY=86400 # 24 hours in seconds

# Admin Email Whitelist (optional)
ADMIN_EMAIL_WHITELIST=admin@company.com,manager@company.com
```

#### 5. Rate Limiting

**Implement rate limiting for admin endpoints:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Apply rate limiting to admin routes
  if (pathname.startsWith('/api/admin')) {
    const ip = request.ip || 'unknown'
    const now = Date.now()
    const windowMs = 60000 // 1 minute
    const maxRequests = 100
    
    const rateLimit = rateLimitMap.get(ip)
    
    if (!rateLimit || now > rateLimit.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    } else if (rateLimit.count < maxRequests) {
      rateLimit.count++
    } else {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/admin/:path*'
}
```

#### 6. Audit Logging

**Track all admin actions:**

```sql
-- Admin audit log table
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
```

```typescript
// lib/supabase/adminAudit.ts
export async function logAdminAction(
  action: string,
  resourceType: string,
  resourceId?: string,
  changes?: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  await supabase.from('admin_audit_log').insert({
    admin_id: user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    changes,
    ip_address: window.location.hostname, // Get from request in API route
    user_agent: navigator.userAgent
  })
}

// Usage example
await logAdminAction('UPDATE_CREDITS', 'user', userId, {
  old_credits: 100,
  new_credits: 500,
  reason: 'Manual adjustment'
})
```

---

## Production Deployment

### Pre-Deployment Checklist

#### ✅ Database Migration

1. Deploy DATABASE_SCHEMA.md migrations to Supabase
2. Add admin-specific columns to profiles table
3. Create admin_users table with RLS policies
4. Set up admin_audit_log table

#### ✅ Authentication Refactor

1. Remove hardcoded credentials from `lib/adminAuth.ts`
2. Implement Supabase Auth for admin login
3. Add role-based access control (RBAC)
4. Create secure session management

#### ✅ API Routes

1. Create `/api/admin/users` for user management
2. Create `/api/admin/config` for configuration updates
3. Create `/api/admin/expenses` for expense tracking
4. Create `/api/admin/analytics` for metrics
5. Add authentication middleware to all admin routes

#### ✅ Environment Variables

1. Add Supabase credentials to production environment
2. Set up admin session secrets
3. Configure email whitelist (optional)
4. Set up rate limiting keys (Redis)

#### ✅ Security Hardening

1. Implement rate limiting on admin endpoints
2. Add CSRF protection
3. Enable audit logging
4. Set up IP whitelisting (optional)
5. Add 2FA for admin accounts (recommended)

#### ✅ Data Migration

1. Migrate localStorage data to Supabase (if needed)
2. Import real user data
3. Import financial records
4. Verify data integrity

#### ✅ Testing

1. Test admin login/logout flow
2. Test user management CRUD operations
3. Test configuration updates
4. Test expense tracking
5. Verify analytics accuracy
6. Test with different admin roles

---

### Migration Script Example

```typescript
// scripts/migrateAdminData.ts
import { supabase } from '@/lib/supabase/client'

async function migrateLocalStorageToSupabase() {
  // 1. Migrate expenses
  const expensesStr = localStorage.getItem('expenses')
  if (expensesStr) {
    const expenses = JSON.parse(expensesStr)
    const { error } = await supabase
      .from('expenses')
      .insert(expenses)
    
    if (error) console.error('Expense migration failed:', error)
    else console.log('✅ Expenses migrated')
  }
  
  // 2. Migrate configuration
  const configStr = localStorage.getItem('adminConfig')
  if (configStr) {
    const config = JSON.parse(configStr)
    const { error } = await supabase
      .from('platform_config')
      .insert({
        ai_credit_rates: config.aiCreditRates,
        pricing_plans: config.pricingPlans,
        platform_settings: config.platformSettings
      })
    
    if (error) console.error('Config migration failed:', error)
    else console.log('✅ Configuration migrated')
  }
  
  console.log('🎉 Migration complete!')
}
```

---

## Admin Routes Map

```
/admin
├── /login                         # Admin authentication
├── /dashboard                     # Main overview dashboard
├── /users                         # User management
├── /expenses                      # Financial expense tracking
├── /settings                      # General admin settings
└── /config
    ├── /ai-credits                # AI credit rate configuration
    ├── /pricing                   # Pricing plan management
    └── /platform                  # Platform-wide settings
```

---

## Access Control Matrix

| Feature | Super Admin | Admin |
|---------|-------------|-------|
| View Dashboard | ✅ | ✅ |
| View Users | ✅ | ✅ |
| Edit User Credits | ✅ | ❌ |
| View Expenses | ✅ | ✅ |
| Add/Edit/Delete Expenses | ✅ | ❌ |
| View Configuration | ✅ | ✅ |
| Edit AI Credit Rates | ✅ | ❌ |
| Edit Pricing Plans | ✅ | ❌ |
| Edit Platform Settings | ✅ | ❌ |

---

## Next Steps

1. **Immediate:** Change default admin password before ANY deployment
2. **Short-term:** Implement Supabase Auth for admin login
3. **Medium-term:** Create API routes for all admin operations
4. **Long-term:** Add advanced features (2FA, IP whitelist, detailed audit logs)

---

**Phase 7 Complete - Admin Dashboard Fully Documented!**

Total Admin Pages: 8  
Total Configuration Options: 25+  
Total Analytics Metrics: 40+  
Security Issues Identified: 6 (with solutions provided)
