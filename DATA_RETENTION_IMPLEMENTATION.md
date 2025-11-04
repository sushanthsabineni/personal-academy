# Data Retention Policy Implementation

## Overview
Complete implementation of GDPR-compliant data retention policies for Personal Academy, meeting Indian Income Tax Act requirements and international privacy standards.

## Retention Periods

### User Data Retention
- **Active Accounts**: Data retained while account is active + 6 months after last activity
- **Grace Period**: 30 days from deletion request to permanent removal
- **User Data**: Courses, credits, referrals, file uploads retained for 6 months after deletion
- **Payment Records**: 7 years (Indian Income Tax Act compliance)
- **Inactive Accounts**: Flagged after 6 months of no activity

### Data Categories

#### Deleted After Grace Period (30 days)
- User profile and account information
- All courses, lessons, modules, and AI-generated content
- Unused credits (non-refundable)
- Credits transaction history
- Referral data and earnings
- File uploads and exported materials
- Account settings and preferences

#### Retained for 7 Years (Tax Compliance)
- Payment transaction records
- Billing information
- Invoice history
- Purchase receipts

## Implementation Files

### 1. Database Schema
**File**: `data-retention-policy.sql` (304 lines)

**New Fields Added**:
```sql
-- Profiles table
deleted_at TIMESTAMPTZ
deletion_scheduled_at TIMESTAMPTZ
last_activity_at TIMESTAMPTZ DEFAULT NOW()
inactive_since TIMESTAMPTZ
should_retain_until TIMESTAMPTZ

-- All data tables (courses, credits_transactions, referrals, etc.)
should_retain_until TIMESTAMPTZ
```

**SQL Functions Created**:
1. `schedule_account_deletion(user_uuid UUID)`
   - Sets 30-day grace period
   - Schedules permanent deletion
   - Returns confirmation details

2. `cancel_account_deletion(user_uuid UUID)`
   - Cancels scheduled deletion
   - Restores account status
   - Clears deletion timestamps

3. `cleanup_deleted_user_data()`
   - Runs daily to remove expired data
   - Deletes accounts past grace period
   - Returns JSON summary of deletions

4. `cleanup_old_payment_records()`
   - Runs monthly to cleanup 7+ year records
   - Respects tax compliance retention
   - Returns count of deleted records

5. `mark_inactive_accounts()`
   - Flags accounts inactive for 6+ months
   - Does not delete, only marks for review
   - Returns count of marked accounts

6. `update_user_activity(user_uuid UUID)`
   - Updates last_activity_at timestamp
   - Called on login, course creation, purchases
   - Keeps activity tracking current

**Views for Monitoring**:
- `accounts_pending_deletion`: Shows accounts in grace period
- `inactive_accounts`: Shows accounts flagged as inactive

### 2. Account Deletion APIs

#### POST /api/account/delete
**Purpose**: Schedule account deletion with grace period

**Request Body**:
```json
{
  "confirmEmail": "user@example.com"
}
```

**Process**:
1. Validates user authentication
2. Requires email confirmation
3. Calls `schedule_account_deletion()` RPC
4. Sends confirmation email
5. Signs out user

**Response**:
```json
{
  "success": true,
  "message": "Account deletion scheduled",
  "deletionDate": "2025-11-23T10:30:00Z",
  "gracePeriod": 30,
  "dataRetentionPolicy": {
    "userDataRetention": "6 months after deletion",
    "paymentRetention": "7 years (Indian tax law)",
    "gracePeriod": 30
  }
}
```

#### DELETE /api/account/delete
**Purpose**: Cancel scheduled account deletion

**Process**:
1. Validates user authentication
2. Calls `cancel_account_deletion()` RPC
3. Sends cancellation confirmation email

**Response**:
```json
{
  "success": true,
  "message": "Account deletion cancelled successfully"
}
```

#### GET /api/account/status
**Purpose**: Check account deletion status

**Response**:
```json
{
  "accountStatus": "pending_deletion" | "active" | "deleted",
  "deletionDate": "2025-11-23T10:30:00Z",
  "daysUntilDeletion": 15,
  "dataRetentionPolicy": {
    "gracePeriod": 30,
    "userDataRetention": "6 months after deletion",
    "paymentRetention": "7 years"
  }
}
```

### 3. Automated Cleanup (Cron Jobs)

#### Daily Cleanup: POST /api/cron/cleanup-data
**Schedule**: Daily at 2:00 AM UTC
**Actions**:
- Runs `cleanup_deleted_user_data()`
- Runs `mark_inactive_accounts()`
- Returns summary of actions taken

**Authorization**: Requires `CRON_SECRET` in Authorization header

**Response**:
```json
{
  "success": true,
  "deletedUsers": 5,
  "deletedCourses": 47,
  "deletedTransactions": 123,
  "markedInactive": 12,
  "timestamp": "2025-10-24T02:00:00Z"
}
```

#### Monthly Cleanup: POST /api/cron/cleanup-payments
**Schedule**: Monthly on 1st at 3:00 AM UTC
**Actions**:
- Runs `cleanup_old_payment_records()`
- Removes payment records older than 7 years
- Complies with Indian Income Tax Act

**Authorization**: Requires `CRON_SECRET` in Authorization header

**Response**:
```json
{
  "success": true,
  "deletedRecords": 234,
  "oldestRetained": "2018-10-01T00:00:00Z",
  "timestamp": "2025-11-01T03:00:00Z"
}
```

#### Supabase Edge Function Alternative
**File**: `/supabase/functions/data-cleanup/index.ts`

Alternative Deno-based Edge Function for Supabase native cron.

**Supported Jobs**:
- `cleanup_deleted_data`
- `mark_inactive`
- `cleanup_payments`
- `run_all`

### 4. Legal Documents Update

**File**: `lib/legalContent.ts`

**Updated Sections**:
- `DATA_RETENTION`: Added detailed retention periods and deletion process
- `USER_RIGHTS`: Updated erasure rights with grace period details
- `FAQ_TRUST_CENTER`: Updated deletion and retention FAQs with new process

**Key Updates**:
```typescript
export const DATA_RETENTION = {
  activeAccounts: "While active + 6 months after last activity",
  deletedAccounts: "30-day grace period, then permanently deleted",
  paymentRecords: "7 years (Indian Income Tax Act compliance)",
  deletionProcess: {
    requestDeletion: "User requests account deletion via settings",
    gracePeriod: "30 days to cancel deletion request",
    permanentDeletion: "All user data removed after grace period expires",
    exceptions: "Payment records retained for 7 years (tax compliance)"
  }
}
```

### 5. Account Settings UI

**File**: `app/account/settings/page.tsx`

**Features Implemented**:

1. **Deletion Status Display**:
   - Fetches status on page load
   - Shows countdown timer if deletion scheduled
   - Displays days remaining in grace period
   - Lists what will be deleted vs retained

2. **Deletion Request Modal**:
   - Email confirmation requirement
   - Comprehensive warning about data loss
   - Data retention timeline explanation
   - Clear listing of deleted/retained items
   - 30-day grace period notification

3. **Cancellation Interface**:
   - One-click cancellation during grace period
   - Confirmation dialog
   - Immediate status update
   - Success notification

4. **Visual States**:
   - **Active Account**: Shows "Delete Account" button in danger zone
   - **Pending Deletion**: Shows orange warning with countdown and "Cancel Deletion" button
   - **Grace Period Info**: Always visible in modal explaining 30-day timeline

## Setup Instructions

### 1. Database Setup

Run the SQL migration in Supabase SQL Editor:

```bash
# Execute data-retention-policy.sql in Supabase dashboard
# SQL Editor → New Query → Paste contents → Run
```

**Verify Installation**:
```sql
-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%deletion%' OR routine_name LIKE '%cleanup%';

-- Check views
SELECT table_name 
FROM information_schema.views 
WHERE table_name IN ('accounts_pending_deletion', 'inactive_accounts');
```

### 2. Environment Variables

Add to `.env.local`:

```env
# Required for cron job authorization
CRON_SECRET=your_secure_random_string_here

# Already configured
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Cron Job Configuration

#### Option A: Vercel Cron (Recommended)

Create `vercel.json`:

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

#### Option B: External Cron Service

Use services like cron-job.org or EasyCron:

**Daily Cleanup**:
- URL: `https://yourapp.com/api/cron/cleanup-data`
- Method: POST
- Schedule: `0 2 * * *` (Daily 2 AM UTC)
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

**Monthly Cleanup**:
- URL: `https://yourapp.com/api/cron/cleanup-payments`
- Method: POST
- Schedule: `0 3 1 * *` (1st of month, 3 AM UTC)
- Headers: `Authorization: Bearer YOUR_CRON_SECRET`

#### Option C: Supabase pg_cron

Enable pg_cron extension and configure:

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily cleanup at 2 AM UTC
SELECT cron.schedule(
  'daily-data-cleanup',
  '0 2 * * *',
  $$ SELECT cleanup_deleted_user_data(); $$
);

-- Daily inactive marking at 2:15 AM UTC
SELECT cron.schedule(
  'daily-inactive-marking',
  '15 2 * * *',
  $$ SELECT mark_inactive_accounts(); $$
);

-- Monthly payment cleanup at 3 AM on 1st
SELECT cron.schedule(
  'monthly-payment-cleanup',
  '0 3 1 * *',
  $$ SELECT cleanup_old_payment_records(); $$
);
```

### 4. Testing

#### Test Account Deletion Flow

```bash
# 1. Request deletion (via UI or API)
curl -X POST https://yourapp.com/api/account/delete \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmEmail": "test@example.com"}'

# 2. Check status
curl https://yourapp.com/api/account/status \
  -H "Authorization: Bearer USER_TOKEN"

# 3. Cancel deletion
curl -X DELETE https://yourapp.com/api/account/delete \
  -H "Authorization: Bearer USER_TOKEN"
```

#### Test Cron Jobs Manually

```bash
# Test daily cleanup
curl -X POST https://yourapp.com/api/cron/cleanup-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test monthly cleanup
curl -X POST https://yourapp.com/api/cron/cleanup-payments \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Or use GET for endpoint info
curl https://yourapp.com/api/cron/cleanup-data
```

#### Monitor Database Views

```sql
-- Check accounts pending deletion
SELECT * FROM accounts_pending_deletion;

-- Check inactive accounts
SELECT * FROM inactive_accounts;

-- Check recent activity
SELECT id, email, last_activity_at, deleted_at, deletion_scheduled_at
FROM profiles
WHERE deleted_at IS NOT NULL OR deletion_scheduled_at IS NOT NULL
LIMIT 10;
```

## Compliance

### GDPR (EU)
✅ Right to erasure implemented with clear process
✅ 30-day grace period allows for correction of accidental deletions
✅ Clear communication about retention periods
✅ User control over data deletion timing

### DPDP Act 2023 (India)
✅ Data retention limited to necessity
✅ Clear deletion process with user consent
✅ Payment records retained per Income Tax Act requirements
✅ Transparent communication about data handling

### CCPA (California)
✅ Right to deletion honored
✅ Clear disclosure of retention periods
✅ No discrimination for exercising deletion rights
✅ Prompt response to deletion requests

### Indian Income Tax Act
✅ Payment records retained for 7 years
✅ Automated cleanup after retention period
✅ Audit trail maintained
✅ Compliant with Section 44AA requirements

## User Experience Flow

### Requesting Account Deletion

1. User navigates to Account Settings
2. Scrolls to "Danger Zone" section
3. Clicks "Delete Account" button
4. Modal opens with:
   - Warning about permanent deletion
   - List of what will be deleted
   - List of what will be retained (payments)
   - Data retention timeline
   - Email confirmation input
5. User enters email to confirm
6. Clicks "Delete My Account"
7. System schedules deletion for 30 days later
8. User receives confirmation email with cancellation link
9. User is signed out

### Canceling Deletion (During Grace Period)

1. User logs back in (can still access account)
2. Navigates to Account Settings
3. Sees orange "Account Deletion Scheduled" banner
4. Countdown shows days remaining
5. Clicks "Cancel Deletion" button
6. Confirms in dialog
7. Account restored to normal status
8. User receives cancellation confirmation email

### After Grace Period Expires

1. Daily cron job runs at 2 AM UTC
2. `cleanup_deleted_user_data()` identifies expired accounts
3. Deletes user data (courses, credits, referrals, files)
4. Marks account as permanently deleted
5. Payment records retained for 7 years
6. User cannot log in or recover account

## Monitoring and Maintenance

### Database Views

Monitor deletion status:

```sql
-- Accounts in grace period
SELECT 
  email,
  deletion_scheduled_at,
  deleted_at,
  EXTRACT(DAY FROM deleted_at - NOW()) as days_remaining
FROM accounts_pending_deletion
ORDER BY deleted_at;

-- Inactive accounts at risk
SELECT 
  email,
  last_activity_at,
  inactive_since,
  EXTRACT(DAY FROM NOW() - last_activity_at) as days_inactive
FROM inactive_accounts
ORDER BY last_activity_at;
```

### Cron Job Logs

Check Vercel logs or external service:

```bash
# Vercel CLI
vercel logs --since 24h

# Filter for cron jobs
vercel logs | grep "cleanup-data\|cleanup-payments"
```

### Metrics to Track

- **Deletion Requests**: Number per month
- **Cancellations**: How many users change their mind
- **Grace Period Usage**: Average cancellation timing
- **Data Cleaned**: MB/GB removed per cleanup
- **Inactive Accounts**: Trend over time
- **Payment Records**: Count and storage size

## Security Considerations

1. **Authorization**: All APIs require valid session tokens
2. **Email Confirmation**: Prevents accidental deletions
3. **Cron Security**: CRON_SECRET prevents unauthorized execution
4. **Service Role**: Cleanup uses service role for admin operations
5. **Audit Trail**: All operations logged to database
6. **RLS Policies**: Row-level security enforced on all queries

## Future Enhancements

### Potential Additions

1. **Data Export Before Deletion**:
   - Generate ZIP with all user data
   - Provide download link in deletion email
   - GDPR data portability compliance

2. **Deletion Reason Tracking**:
   - Optional survey on deletion request
   - Track common reasons for churn
   - Improve product based on feedback

3. **Graduated Deletion**:
   - Delete different data types at different intervals
   - Keep analytics longer (anonymized)
   - More granular retention policies

4. **Account Freeze Option**:
   - Temporary suspension instead of deletion
   - Retain data longer for returning users
   - Middle ground between active and deleted

5. **Admin Dashboard**:
   - View pending deletions
   - Manual intervention capability
   - Bulk retention policy management

6. **Email Reminders**:
   - Reminder at 7 days before deletion
   - Final warning at 1 day before
   - Post-deletion confirmation

## Support and Documentation

### User Documentation

Add to Help Center:
- "How to Delete Your Account"
- "Understanding Data Retention"
- "Canceling Account Deletion"
- "What Happens to My Data"

### Internal Documentation

Maintain runbooks for:
- Manual deletion requests
- Data recovery during grace period
- Troubleshooting cron failures
- Compliance audit procedures

## Troubleshooting

### Common Issues

**Cron Jobs Not Running**:
```bash
# Check Vercel cron configuration
vercel crons ls

# Verify CRON_SECRET is set
vercel env ls

# Test endpoint directly
curl -X POST https://yourapp.com/api/cron/cleanup-data \
  -H "Authorization: Bearer CRON_SECRET"
```

**Deletion Not Processing**:
```sql
-- Check if function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'cleanup_deleted_user_data';

-- Run manually
SELECT cleanup_deleted_user_data();

-- Check for errors
SELECT * FROM profiles WHERE deleted_at < NOW();
```

**Status Not Updating**:
```typescript
// Force refresh in UI
await fetchDeletionStatus()

// Check API response
const response = await fetch('/api/account/status')
const data = await response.json()
console.log(data)
```

## Conclusion

This implementation provides a comprehensive, compliant, and user-friendly data retention system that:

✅ Meets legal requirements (GDPR, DPDP Act, CCPA, Indian tax law)
✅ Gives users control over their data
✅ Provides safety net with 30-day grace period
✅ Automates cleanup to reduce manual work
✅ Maintains audit trail for compliance
✅ Scales with user growth
✅ Clear documentation for maintenance

The system is production-ready and requires only:
1. Running the SQL migration
2. Setting the CRON_SECRET environment variable
3. Configuring cron jobs (Vercel or external)

All code is implemented, tested, and ready for deployment.
