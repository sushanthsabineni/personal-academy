# Data Retention Policy - Quick Deployment Guide

## ✅ Pre-Deployment Checklist

### Files Created (All Ready)
- [x] `data-retention-policy.sql` - Database schema and functions
- [x] `/app/api/account/delete/route.ts` - Deletion API
- [x] `/app/api/account/status/route.ts` - Status API
- [x] `/app/api/cron/cleanup-data/route.ts` - Daily cleanup
- [x] `/app/api/cron/cleanup-payments/route.ts` - Monthly cleanup
- [x] `/supabase/functions/data-cleanup/index.ts` - Edge Function (optional)
- [x] `/app/account/settings/page.tsx` - UI with deletion modal
- [x] `lib/legalContent.ts` - Updated legal docs

## 🚀 Deployment Steps

### Step 1: Database Migration (Required)
```bash
# 1. Open Supabase Dashboard
# 2. Navigate to SQL Editor
# 3. Create new query
# 4. Copy contents of data-retention-policy.sql
# 5. Paste and click "Run"
```

**Verify Success**:
```sql
-- Should return 6 functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN (
  'schedule_account_deletion',
  'cancel_account_deletion', 
  'cleanup_deleted_user_data',
  'cleanup_old_payment_records',
  'mark_inactive_accounts',
  'update_user_activity'
);

-- Should return 2 views
SELECT table_name FROM information_schema.views 
WHERE table_name IN ('accounts_pending_deletion', 'inactive_accounts');
```

### Step 2: Environment Variables (Required)
Add to `.env.local` and production:

```env
# Generate a secure random string for cron authorization
CRON_SECRET=your_secure_random_secret_here

# Example generation (use one of these):
# - Node.js: require('crypto').randomBytes(32).toString('hex')
# - OpenSSL: openssl rand -hex 32
# - Online: https://randomkeygen.com/
```

**Add to Vercel/Production**:
```bash
# Using Vercel CLI
vercel env add CRON_SECRET

# Or via Vercel Dashboard:
# Settings → Environment Variables → Add CRON_SECRET
```

### Step 3: Configure Cron Jobs (Required)

#### Option A: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-data",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup-payments", 
      "schedule": "0 3 1 * *"
    }
  ]
}
```

Deploy to activate:
```bash
vercel deploy
```

Verify in Vercel Dashboard:
- Settings → Cron Jobs → Should see 2 jobs

#### Option B: EasyCron or cron-job.org

1. Sign up at https://www.easycron.com or https://cron-job.org
2. Create two jobs:

**Daily Cleanup**:
- URL: `https://yourapp.com/api/cron/cleanup-data`
- Method: POST
- Schedule: `0 2 * * *` (Daily at 2 AM UTC)
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

**Monthly Cleanup**:
- URL: `https://yourapp.com/api/cron/cleanup-payments`
- Method: POST  
- Schedule: `0 3 1 * *` (Monthly 1st at 3 AM UTC)
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

#### Option C: Supabase pg_cron

Run in Supabase SQL Editor:

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily cleanup
SELECT cron.schedule(
  'daily-data-cleanup',
  '0 2 * * *',
  $$ SELECT cleanup_deleted_user_data(); $$
);

-- Daily inactive marking
SELECT cron.schedule(
  'daily-inactive-marking', 
  '15 2 * * *',
  $$ SELECT mark_inactive_accounts(); $$
);

-- Monthly payment cleanup
SELECT cron.schedule(
  'monthly-payment-cleanup',
  '0 3 1 * *',
  $$ SELECT cleanup_old_payment_records(); $$
);

-- List all scheduled jobs
SELECT * FROM cron.job;
```

### Step 4: Test the System

#### Test 1: Account Status API
```bash
# Should return account status (must be logged in)
curl https://yourapp.com/api/account/status \
  -H "Authorization: Bearer USER_TOKEN"
```

#### Test 2: Deletion Request
```bash
# Test via UI: Settings → Account → Delete Account
# Or via API:
curl -X POST https://yourapp.com/api/account/delete \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmEmail": "test@example.com"}'
```

#### Test 3: Cron Jobs
```bash
# Test daily cleanup (must use correct CRON_SECRET)
curl -X POST https://yourapp.com/api/cron/cleanup-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test monthly cleanup
curl -X POST https://yourapp.com/api/cron/cleanup-payments \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Test 4: Database Functions
```sql
-- Test schedule deletion (use real UUID)
SELECT schedule_account_deletion('user-uuid-here');

-- Check pending deletions
SELECT * FROM accounts_pending_deletion;

-- Test cleanup (will delete expired accounts)
SELECT cleanup_deleted_user_data();

-- Check inactive accounts
SELECT * FROM inactive_accounts;
```

## 📊 Monitoring

### Daily Checks (First Week)

```sql
-- Accounts pending deletion
SELECT COUNT(*) as pending_count FROM accounts_pending_deletion;

-- Recently deleted accounts
SELECT COUNT(*) as deleted_today 
FROM profiles 
WHERE deleted_at::date = CURRENT_DATE;

-- Inactive accounts
SELECT COUNT(*) as inactive_count FROM inactive_accounts;
```

### Weekly Checks

```sql
-- Deletion trends
SELECT 
  DATE_TRUNC('week', deletion_scheduled_at) as week,
  COUNT(*) as deletion_requests
FROM profiles
WHERE deletion_scheduled_at IS NOT NULL
GROUP BY week
ORDER BY week DESC
LIMIT 4;

-- Cancellation rate
SELECT 
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as cancelled,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as completed,
  ROUND(COUNT(CASE WHEN deleted_at IS NULL THEN 1 END)::numeric / 
        COUNT(*)::numeric * 100, 2) as cancellation_rate
FROM profiles
WHERE deletion_scheduled_at IS NOT NULL;
```

### Cron Job Monitoring

```bash
# Vercel logs (last 24 hours)
vercel logs --since 24h | grep "cron"

# Check specific endpoint
vercel logs --since 24h | grep "cleanup-data"

# View in dashboard
# Vercel Dashboard → Logs → Filter by "cron"
```

## 🐛 Troubleshooting

### Issue: Cron Jobs Not Running

**Check 1: Verify Configuration**
```bash
# Vercel
vercel crons ls

# External service
# Check service dashboard for job status
```

**Check 2: Test Manually**
```bash
curl -X POST https://yourapp.com/api/cron/cleanup-data \
  -H "Authorization: Bearer CRON_SECRET" \
  -v  # Verbose output
```

**Check 3: Verify Environment Variable**
```bash
# Vercel
vercel env ls | grep CRON_SECRET

# Should show CRON_SECRET in production
```

### Issue: Deletions Not Processing

**Check 1: SQL Functions Exist**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%cleanup%';
```

**Check 2: Run Manually**
```sql
SELECT cleanup_deleted_user_data();
-- Should return JSON with counts
```

**Check 3: Check for Errors**
```sql
-- Look for accounts that should be deleted
SELECT id, email, deleted_at, 
       EXTRACT(DAY FROM NOW() - deleted_at) as days_past_deletion
FROM profiles
WHERE deleted_at < NOW()
  AND deleted_at IS NOT NULL;
```

### Issue: UI Not Showing Status

**Check 1: API Response**
```javascript
// In browser console on settings page
const response = await fetch('/api/account/status')
const data = await response.json()
console.log(data)
```

**Check 2: React State**
```javascript
// Add to page.tsx temporarily
console.log('Deletion Status:', deletionStatus)
```

**Check 3: Database State**
```sql
-- Check current user (replace with actual email)
SELECT deleted_at, deletion_scheduled_at, last_activity_at
FROM profiles
WHERE email = 'user@example.com';
```

## 📈 Performance Optimization

### Index Creation (Optional but Recommended)

```sql
-- Speed up cleanup queries
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at 
ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_last_activity 
ON profiles(last_activity_at);

CREATE INDEX IF NOT EXISTS idx_payments_retention 
ON payments(should_retain_until);
```

### Batch Size Tuning

If cleanup is slow, adjust batch sizes in SQL functions:

```sql
-- Edit cleanup_deleted_user_data function
-- Change DELETE queries to use LIMIT
DELETE FROM profiles 
WHERE deleted_at < NOW() 
  AND deleted_at IS NOT NULL
LIMIT 100;  -- Process in batches
```

## 🔐 Security Audit

### Checklist

- [ ] CRON_SECRET is strong and not exposed
- [ ] Service role key is never exposed to client
- [ ] RLS policies prevent unauthorized access
- [ ] Email confirmation required for deletion
- [ ] Audit logs enabled for sensitive operations
- [ ] Payment data retention follows tax law
- [ ] User data properly cleaned after grace period

### Audit Queries

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename IN ('profiles', 'payments', 'courses');

-- Verify payment retention
SELECT 
  COUNT(*) as total_payments,
  MIN(created_at) as oldest_payment,
  MAX(created_at) as newest_payment
FROM payments
WHERE should_retain_until > NOW();
```

## 📝 Documentation Updates

### Update Help Center
- [ ] Create "How to Delete Account" guide
- [ ] Update Privacy Policy link
- [ ] Add FAQ about data retention
- [ ] Document grace period process

### Internal Documentation  
- [ ] Add to ops runbook
- [ ] Document emergency recovery process
- [ ] Create escalation procedure
- [ ] Add to compliance checklist

## ✨ Post-Deployment

### First 24 Hours
1. Monitor cron job execution (should run at 2 AM UTC)
2. Check for any SQL errors in Supabase logs
3. Test deletion flow with test account
4. Verify emails are sending

### First Week
1. Review deletion requests (if any)
2. Monitor cancellation rate
3. Check database performance
4. Gather user feedback on UI

### First Month
1. Analyze deletion trends
2. Optimize SQL queries if needed
3. Review retention policy effectiveness
4. Update documentation based on learnings

## 🎉 Success Criteria

Your deployment is successful when:

- [x] SQL migration completed without errors
- [x] Cron jobs running on schedule
- [x] Test account deletion works end-to-end
- [x] Grace period countdown displays correctly
- [x] Cancellation flow works
- [x] Payment records retained properly
- [x] No TypeScript compilation errors
- [x] All API endpoints responding correctly

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review Supabase logs: Dashboard → Logs
3. Check Vercel logs: `vercel logs --since 24h`
4. Test API endpoints manually with curl
5. Verify database state with SQL queries

## 🔗 Related Documentation

- Full Implementation Guide: `DATA_RETENTION_IMPLEMENTATION.md`
- Database Schema: `data-retention-policy.sql`
- Privacy Policy: `lib/legalContent.ts`
- Settings UI: `app/account/settings/page.tsx`

---

**Deployment Time**: ~30 minutes  
**Downtime Required**: None  
**Rollback Plan**: Restore from database backup if issues occur

**Last Updated**: October 24, 2025
