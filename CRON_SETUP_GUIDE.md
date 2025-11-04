# Cron Jobs Setup Guide

## ✅ Step 1: CRON_SECRET Generated

Your secure CRON_SECRET has been added to `.env.local`:
```
CRON_SECRET=8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13
```

⚠️ **IMPORTANT**: This secret authorizes data deletion operations. Keep it secure!

## 📝 Step 2: Choose Your Cron Configuration

You have **3 options** for running the automated cleanup jobs. Choose the one that best fits your deployment:

---

## Option A: Vercel Cron (Recommended for Vercel Deployments)

### ✅ Files Already Created
- `vercel.json` - Cron configuration file (already created)

### 🚀 Setup Steps

1. **Deploy to Vercel** (if not already deployed):
   ```bash
   # Install Vercel CLI (if not installed)
   npm install -g vercel
   
   # Deploy
   vercel deploy
   ```

2. **Add CRON_SECRET to Vercel**:
   
   **Option 2A: Via Vercel Dashboard** (Easier)
   - Go to https://vercel.com/dashboard
   - Select your project (personal-academy)
   - Go to **Settings** → **Environment Variables**
   - Click **Add New**
   - Name: `CRON_SECRET`
   - Value: `8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13`
   - Environments: Select **Production**, **Preview**, **Development**
   - Click **Save**

   **Option 2B: Via CLI** (if you have Vercel CLI installed)
   ```bash
   vercel env add CRON_SECRET
   # When prompted:
   # - Enter value: 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13
   # - Select environments: Production, Preview, Development
   ```

3. **Redeploy to apply changes**:
   ```bash
   vercel --prod
   ```

4. **Verify Cron Jobs**:
   - Go to Vercel Dashboard → Your Project → **Settings** → **Cron Jobs**
   - You should see:
     - `cleanup-data` - Runs daily at 2:00 AM UTC
     - `cleanup-payments` - Runs monthly on 1st at 3:00 AM UTC

### ⏰ Cron Schedules Configured
- **Daily Cleanup**: `/api/cron/cleanup-data` - Every day at 2:00 AM UTC
- **Monthly Cleanup**: `/api/cron/cleanup-payments` - 1st of every month at 3:00 AM UTC

---

## Option B: External Cron Service (EasyCron / Cron-Job.org)

Use this if you're NOT deploying to Vercel or want more control.

### 🌐 Setup with EasyCron.com

1. **Sign up** at https://www.easycron.com (free tier available)

2. **Create Daily Cleanup Job**:
   - Click **+ Add Cron Job**
   - **URL**: `https://personalacademy.app/api/cron/cleanup-data`
   - **Method**: POST
   - **Cron Expression**: `0 2 * * *` (Daily at 2 AM UTC)
   - **Headers**: Click "Add Header"
     - Name: `Authorization`
     - Value: `Bearer 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13`
   - Click **Create**

3. **Create Monthly Cleanup Job**:
   - Click **+ Add Cron Job**
   - **URL**: `https://personalacademy.app/api/cron/cleanup-payments`
   - **Method**: POST
   - **Cron Expression**: `0 3 1 * *` (1st of month at 3 AM UTC)
   - **Headers**:
     - Name: `Authorization`
     - Value: `Bearer 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13`
   - Click **Create**

### 🌐 Alternative: Cron-Job.org

1. **Sign up** at https://cron-job.org (free)

2. **Create Daily Cleanup Job**:
   - Click **Create cronjob**
   - **Title**: Daily User Data Cleanup
   - **URL**: `https://personalacademy.app/api/cron/cleanup-data`
   - **Schedule**:
     - Minutes: 0
     - Hours: 2
     - Day of month: *
     - Month: *
     - Day of week: *
   - **Request method**: POST
   - **Request headers**:
     ```
     Authorization: Bearer 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13
     ```
   - Click **Create**

3. **Create Monthly Cleanup Job**:
   - Similar setup but with:
     - **Title**: Monthly Payment Record Cleanup
     - **URL**: `https://personalacademy.app/api/cron/cleanup-payments`
     - **Schedule**: Day of month: 1, Hours: 3

---

## Option C: Supabase pg_cron (Database-Level Cron)

Use this for database-native scheduling without external services.

### 📊 Setup Steps

1. **Enable pg_cron extension** in Supabase SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

2. **Schedule Daily Cleanup Jobs**:
   ```sql
   -- Daily data cleanup at 2:00 AM UTC
   SELECT cron.schedule(
     'daily-data-cleanup',
     '0 2 * * *',
     $$ SELECT cleanup_deleted_user_data(); $$
   );
   
   -- Daily inactive account marking at 2:15 AM UTC
   SELECT cron.schedule(
     'daily-inactive-marking',
     '15 2 * * *',
     $$ SELECT mark_inactive_accounts(); $$
   );
   ```

3. **Schedule Monthly Payment Cleanup**:
   ```sql
   -- Monthly payment cleanup at 3:00 AM on 1st
   SELECT cron.schedule(
     'monthly-payment-cleanup',
     '0 3 1 * *',
     $$ SELECT cleanup_old_payment_records(); $$
   );
   ```

4. **Verify Jobs Are Scheduled**:
   ```sql
   -- List all scheduled jobs
   SELECT * FROM cron.job;
   
   -- View job run history
   SELECT * FROM cron.job_run_details 
   ORDER BY start_time DESC 
   LIMIT 10;
   ```

5. **Monitor Job Execution**:
   ```sql
   -- Check if jobs are running
   SELECT 
     jobname,
     last_run_time,
     last_run_status,
     run_count
   FROM cron.job
   ORDER BY last_run_time DESC;
   ```

### 🔧 Troubleshooting pg_cron

If jobs don't run:
```sql
-- Check if pg_cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check for errors
SELECT * FROM cron.job_run_details 
WHERE status = 'failed'
ORDER BY start_time DESC;

-- Unschedule a job if needed
SELECT cron.unschedule('job-name-here');
```

---

## 🧪 Testing Your Setup

### Test Cron Endpoints Manually

**Test Daily Cleanup**:
```bash
curl -X POST https://personalacademy.app/api/cron/cleanup-data \
  -H "Authorization: Bearer 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13"
```

Expected Response:
```json
{
  "success": true,
  "deletedUsers": 0,
  "deletedCourses": 0,
  "deletedTransactions": 0,
  "markedInactive": 0,
  "timestamp": "2025-10-26T..."
}
```

**Test Monthly Cleanup**:
```bash
curl -X POST https://personalacademy.app/api/cron/cleanup-payments \
  -H "Authorization: Bearer 8fd346f138a8bf33379303eb8e70618cb7bd4690e353c00fe060aa8aa7976c13"
```

Expected Response:
```json
{
  "success": true,
  "deletedRecords": 0,
  "timestamp": "2025-10-26T..."
}
```

### Test GET Endpoints (No Auth Required)

```bash
# Get daily cleanup info
curl https://personalacademy.app/api/cron/cleanup-data

# Get monthly cleanup info
curl https://personalacademy.app/api/cron/cleanup-payments
```

---

## 📊 Monitoring

### Check Vercel Logs (if using Option A)
```bash
vercel logs --since 24h | grep "cron"
```

### Check Database for Pending Deletions
```sql
-- See accounts scheduled for deletion
SELECT * FROM accounts_pending_deletion;

-- See inactive accounts
SELECT * FROM inactive_accounts;
```

### Monitor Cleanup Effectiveness
```sql
-- Check recent deletions
SELECT 
  DATE_TRUNC('day', deleted_at) as deletion_date,
  COUNT(*) as accounts_deleted
FROM profiles
WHERE deleted_at IS NOT NULL
  AND deleted_at > NOW() - INTERVAL '30 days'
GROUP BY deletion_date
ORDER BY deletion_date DESC;
```

---

## ✅ Verification Checklist

- [ ] CRON_SECRET added to `.env.local` ✅ (Already done)
- [ ] CRON_SECRET added to production environment (Vercel/Hosting)
- [ ] `vercel.json` created ✅ (Already done for Option A)
- [ ] Cron jobs configured (choose one option above)
- [ ] Test endpoints respond correctly
- [ ] Database migration completed (`data-retention-policy.sql`)
- [ ] SQL functions verified in Supabase

---

## 🔒 Security Notes

1. **Never commit** `.env.local` to git (already in `.gitignore`)
2. **Rotate CRON_SECRET** every 90 days
3. **Monitor cron logs** for unauthorized access attempts
4. **Use different secrets** for development/staging/production
5. **Restrict cron URLs** to specific IP ranges if possible (advanced)

---

## 📞 Next Steps

1. **Choose** one of the three cron options above
2. **Follow** the setup steps for your chosen option
3. **Test** the endpoints manually
4. **Monitor** the first few runs to ensure everything works
5. **Check** database views to verify data is being cleaned

---

## 🆘 Troubleshooting

### Cron Job Not Running?

**For Vercel**:
- Check Vercel Dashboard → Cron Jobs tab
- Verify CRON_SECRET is in environment variables
- Check function logs for errors

**For External Services**:
- Verify URL is correct (https://)
- Check Authorization header format
- Look at service dashboard for failed requests

**For pg_cron**:
- Check `cron.job_run_details` for errors
- Verify functions exist: `SELECT * FROM information_schema.routines WHERE routine_name LIKE '%cleanup%'`
- Ensure extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_cron'`

### Getting 401 Unauthorized?
- CRON_SECRET doesn't match between cron service and environment variable
- Missing `Bearer ` prefix in Authorization header
- CRON_SECRET not deployed to production

### Jobs Running But Nothing Deleted?
- No data meets deletion criteria yet (30-day grace period not expired)
- Check `accounts_pending_deletion` view - might be empty
- Verify SQL functions with `SELECT cleanup_deleted_user_data()`

---

## 📚 Related Files

- **Cron Endpoints**: `/app/api/cron/cleanup-data/route.ts`, `/app/api/cron/cleanup-payments/route.ts`
- **SQL Migration**: `data-retention-policy.sql`
- **Full Documentation**: `DATA_RETENTION_IMPLEMENTATION.md`
- **Quick Guide**: `DATA_RETENTION_DEPLOYMENT.md`

---

**Setup Time**: 10-15 minutes  
**No Downtime Required**  
**Last Updated**: October 26, 2025
