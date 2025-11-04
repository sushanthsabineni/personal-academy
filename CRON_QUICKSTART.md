# 🚀 Quick Setup - CRON_SECRET & Cron Jobs

## ✅ COMPLETED

### 1. CRON_SECRET Generated & Added
- ✅ Added to `.env.local`
- ✅ Secure 64-character hex string generated
- ⏳ **Next**: Add to production environment

### 2. Vercel Configuration Created
- ✅ `vercel.json` created with cron schedules
- ✅ Daily cleanup: 2:00 AM UTC
- ✅ Monthly cleanup: 1st of month at 3:00 AM UTC
- ✅ Daily credit expiration: 3:00 AM UTC

---

## 🎯 NEXT STEPS (Choose One Option)

### Option A: Vercel Cron (Easiest - 5 minutes)

1. **Go to Vercel Dashboard**: <https://vercel.com/dashboard>
2. **Select** your project: `personal-academy`
3. **Go to**: Settings → Environment Variables
4. **Add Variable**:
   - Name: `CRON_SECRET`
   - Value: `8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13`
   - Environments: ✓ Production ✓ Preview ✓ Development
5. **Deploy**: `vercel --prod` or use Vercel Dashboard
6. **Verify**: Settings → Cron Jobs (should show 2 jobs)

### Option B: EasyCron (5-10 minutes)

1. **Sign up**: <https://www.easycron.com>
2. **Create 2 jobs** with these settings:

**Job 1 - Daily Cleanup**:
- URL: `https://personalacademy.app/api/cron/cleanup-data`
- Method: POST
- Schedule: `0 2 * * *`
- Header: `Authorization: Bearer 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13`

**Job 2 - Monthly Cleanup**:
- URL: `https://personalacademy.app/api/cron/cleanup-payments`
- Method: POST
- Schedule: `0 3 1 * *`
- Header: `Authorization: Bearer 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13`

### Option C: Supabase pg_cron (Database-Native - 2 minutes)

Run in **Supabase SQL Editor**:

```sql
-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily cleanup at 2 AM UTC
SELECT cron.schedule('daily-data-cleanup', '0 2 * * *', 
  $$ SELECT cleanup_deleted_user_data(); $$);

-- Daily inactive marking at 2:15 AM UTC
SELECT cron.schedule('daily-inactive-marking', '15 2 * * *', 
  $$ SELECT mark_inactive_accounts(); $$);

-- Monthly payment cleanup at 3 AM on 1st
SELECT cron.schedule('monthly-payment-cleanup', '0 3 1 * *', 
  $$ SELECT cleanup_old_payment_records(); $$);

-- Daily credit expiration at 3 AM UTC
SELECT cron.schedule('expire-old-credits', '0 3 * * *', 
  $$ SELECT expire_old_credits(); $$);

-- Verify
SELECT * FROM cron.job;
```

---

## 🧪 TEST IT

After setup, test with curl (PowerShell):

```powershell
# Test daily cleanup
Invoke-WebRequest -Uri "https://personalacademy.app/api/cron/cleanup-data" -Method POST -Headers @{"Authorization"="Bearer 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13"}

# Test monthly cleanup
Invoke-WebRequest -Uri "https://personalacademy.app/api/cron/cleanup-payments" -Method POST -Headers @{"Authorization"="Bearer 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13"}
```

Expected: JSON response with `"success": true`

---

## 📊 MONITOR

### Database Monitoring (Supabase SQL Editor)

```sql
-- Check pending deletions
SELECT * FROM accounts_pending_deletion;

-- Check inactive accounts
SELECT * FROM inactive_accounts;
```

### Vercel Logs (if using Option A)

Dashboard → Your Project → Logs → Filter: "cron"

---

## ✅ CHECKLIST

- [x] CRON_SECRET generated and added to `.env.local`
- [x] `vercel.json` created
- [ ] CRON_SECRET added to production (Vercel/hosting)
- [ ] Cron jobs configured (choose option A, B, or C above)
- [ ] Tested endpoints manually
- [ ] Verified first cron run works

---

## 📚 FULL DETAILS

See `CRON_SETUP_GUIDE.md` for comprehensive documentation including:
- Detailed setup for all 3 options
- Troubleshooting guide
- Security best practices
- Monitoring queries

---

**Estimated Setup Time**: 5-10 minutes  
**Recommended Option**: A (Vercel) if deploying to Vercel, C (pg_cron) otherwise
