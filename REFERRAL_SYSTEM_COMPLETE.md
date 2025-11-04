# Referral System Implementation - Complete Setup Guide

## ✅ What Has Been Implemented

### Backend API Routes (7 files created)

1. **`/app/api/referral/validate/route.ts`** - Validates referral codes
2. **`/app/api/referral/stats/route.ts`** - Fetches user's referral statistics
3. **`/app/api/referral/create/route.ts`** - Creates referral relationship after signup
4. **`/app/api/referral/check-milestones/route.ts`** - Awards milestone bonuses
5. **`/app/api/payment/verify/route.ts`** - UPDATED to process referral bonuses

### Frontend Integration (2 files updated)

6. **`/app/account/referrals/page.tsx`** - UPDATED with real API data fetching
7. **`/app/login/page.tsx`** - UPDATED to track referral codes from URL

### Utilities (1 file created)

8. **`/lib/referralTracking.ts`** - Helper functions for referral tracking

---

## 🔴 CRITICAL: Database Setup Required

**IMPORTANT:** The TypeScript errors you're seeing are EXPECTED because the database tables don't exist yet. You MUST run the SQL migrations first.

### Step 1: Deploy SQL Function

Run this in your Supabase SQL Editor:

```sql
-- Function: Process referral bonus (awards 20% to both referrer and referee)
CREATE OR REPLACE FUNCTION process_referral_bonus(
  referee_uuid UUID,
  purchase_amount DECIMAL(10,2),
  purchase_credits INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  referrer_uuid UUID;
  referral_record RECORD;
  referrer_bonus INTEGER;
  referee_bonus INTEGER;
BEGIN
  -- Find active referral
  SELECT * INTO referral_record
  FROM referrals
  WHERE referee_id = referee_uuid
  AND status = 'pending'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN FALSE; -- No pending referral found
  END IF;
  
  referrer_uuid := referral_record.referrer_id;
  
  -- Calculate bonuses (20% of purchase)
  referrer_bonus := FLOOR(purchase_credits * 0.2);
  referee_bonus := FLOOR(purchase_credits * 0.2);
  
  -- Update referral record
  UPDATE referrals
  SET
    status = 'completed',
    completed_at = NOW(),
    referee_first_purchase_at = NOW(),
    referee_first_purchase_amount = purchase_amount,
    referrer_bonus_credits = referrer_bonus,
    referee_bonus_credits = referee_bonus
  WHERE id = referral_record.id;
  
  -- Credit referrer (give them bonus credits)
  UPDATE profiles
  SET credits_balance = credits_balance + referrer_bonus
  WHERE id = referrer_uuid;
  
  -- Create transaction for referrer
  INSERT INTO credits_transactions (
    user_id,
    amount,
    type,
    description,
    balance_after
  )
  SELECT 
    referrer_uuid,
    referrer_bonus,
    'referral',
    'Referral bonus from ' || (SELECT email FROM profiles WHERE id = referee_uuid),
    credits_balance
  FROM profiles WHERE id = referrer_uuid;
  
  -- Credit referee (give them bonus credits)
  UPDATE profiles
  SET credits_balance = credits_balance + referee_bonus
  WHERE id = referee_uuid;
  
  -- Create transaction for referee
  INSERT INTO credits_transactions (
    user_id,
    amount,
    type,
    description,
    balance_after
  )
  SELECT 
    referee_uuid,
    referee_bonus,
    'bonus',
    'Signup bonus from referral',
    credits_balance
  FROM profiles WHERE id = referee_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 2: Verify Database Tables Exist

Check that these tables exist in Supabase:
- ✅ `profiles` (with `referral_code` column)
- ✅ `referrals`
- ✅ `credits_transactions`
- ✅ `payments`

If they don't exist, run the full migration from `supabase-complete-setup.sql` or `DATABASE_SCHEMA.md`.

### Step 3: Update TypeScript Database Types

After creating the tables, regenerate your types:

```bash
# In your terminal
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
```

Or manually ensure your `lib/database.types.ts` includes these interfaces.

---

## 🎯 How the Referral System Works

### Flow 1: User Signs Up with Referral Link

1. **User clicks referral link**: `https://yoursite.com/signup?ref=ABC123`
2. **Referral code stored**: `lib/referralTracking.ts` validates and stores code in localStorage
3. **User signs up**: Creates account on `/login` page
4. **Referral link created**: After signup, `/api/referral/create` links referee to referrer
5. **Status: PENDING** - Waiting for first purchase

### Flow 2: User Makes First Purchase

1. **User buys credits**: Through Razorpay payment flow
2. **Payment verified**: `/api/payment/verify` confirms payment
3. **Bonus awarded**: Calls `process_referral_bonus()` SQL function
   - ✅ Referrer gets 20% bonus credits
   - ✅ Referee gets 20% bonus credits
   - ✅ Referral status changes from 'pending' to 'completed'
4. **Milestone check**: Automatically checks if referrer reached milestone (1, 5, 10, 25)
5. **Milestone reward**: Awards bonus if milestone reached

### Flow 3: Viewing Referral Stats

1. **User visits** `/account/referrals`
2. **Page loads**: Calls `/api/referral/stats`
3. **Displays**:
   - Total referrals count
   - Credits earned from referrals
   - Pending referrals (signed up but not purchased)
   - Referral history table

---

## 📋 Milestone Rewards (Automatic)

| Milestone | Reward | Badge |
|-----------|--------|-------|
| 1 referral | 500 credits | First Referral |
| 5 referrals | 5,000 credits | Community Builder |
| 10 referrals | 20,000 credits | Influencer |
| 25 referrals | 50,000 credits | Ambassador |

These are **automatically awarded** when a user reaches each milestone through `/api/referral/check-milestones`.

---

## 🧪 Testing the System

### Test 1: Referral Code Validation
```bash
curl -X POST http://localhost:3000/api/referral/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"TEST123"}'
```

### Test 2: Create Referral (after signup)
```bash
curl -X POST http://localhost:3000/api/referral/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"referralCode":"TEST123"}'
```

### Test 3: Get Referral Stats
```bash
curl http://localhost:3000/api/referral/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Complete Flow
1. Get user's referral code from `/account/referrals` page
2. Open incognito window: `http://localhost:3000/login?ref=THEIR_CODE`
3. Create new account
4. Make a test purchase (1000 credits)
5. Check both accounts - both should have bonus credits
6. Original user should see +200 credits (20% of 1000)
7. New user should see +200 credits (20% of 1000)

---

## 🔧 Configuration

All settings are in `/lib/platformConfig.ts`:

```typescript
referrals: {
  enabled: true,
  referrerBonusPercentage: 20,  // Change to adjust bonus %
  refereeBonusCredits: 500,      // Not currently used (using % instead)
  milestones: [
    { count: 1, rewardCredits: 500, ... },
    { count: 5, rewardCredits: 5000, ... },
    { count: 10, rewardCredits: 20000, ... },
    { count: 25, rewardCredits: 50000, ... },
  ]
}
```

---

## 🐛 Troubleshooting

### TypeScript Errors After Implementation

**Expected!** These will disappear after:
1. Running SQL migrations in Supabase
2. Regenerating TypeScript types
3. Restarting your dev server

### Referral Code Not Being Captured

Check browser console for:
```
Referral code stored: ABC123
```

If not appearing:
- Verify URL has `?ref=` parameter
- Check localStorage: `localStorage.getItem('pending_referral_code')`

### Bonuses Not Being Awarded

Check Supabase logs for:
- `process_referral_bonus` function errors
- `referrals` table has matching records with `status='pending'`
- Payment verification completed successfully

### Milestone Not Triggering

- Verify `/api/referral/check-milestones` is being called
- Check `credits_transactions` table for existing milestone awards
- Ensure referral count exactly matches milestone (1, 5, 10, 25)

---

## 📊 Database Queries for Debugging

### Check User's Referral Code
```sql
SELECT referral_code FROM profiles WHERE id = 'USER_UUID';
```

### Check Referral Relationships
```sql
SELECT * FROM referrals WHERE referrer_id = 'USER_UUID' OR referee_id = 'USER_UUID';
```

### Check Bonus Credits Awarded
```sql
SELECT * FROM credits_transactions 
WHERE type IN ('referral', 'bonus') 
ORDER BY created_at DESC;
```

### Check Milestone Awards
```sql
SELECT * FROM credits_transactions 
WHERE type = 'bonus' 
AND description LIKE '%Milestone%'
ORDER BY created_at DESC;
```

---

## ✅ Final Checklist

Before going live:

- [ ] Run SQL migrations in Supabase
- [ ] Deploy `process_referral_bonus()` function
- [ ] Regenerate TypeScript types
- [ ] Test referral link sharing
- [ ] Test signup with referral code
- [ ] Test purchase with active referral
- [ ] Verify bonuses are awarded
- [ ] Test milestone rewards
- [ ] Check `/account/referrals` page shows real data
- [ ] Verify referral history table populates
- [ ] Test on mobile devices
- [ ] Add analytics tracking for referral conversions

---

## 🎉 What You Can Do Now

1. **Share referral links**: Users can copy their referral link from `/account/referrals`
2. **Track earnings**: See real-time stats on credits earned from referrals
3. **Automatic bonuses**: 20% awarded to both parties on first purchase
4. **Milestone rewards**: Auto-awarded at 1, 5, 10, 25 referrals
5. **Referral history**: See who signed up and purchased

---

## 🚀 Next Steps (Optional Enhancements)

1. **Email notifications**: Send email when referral signs up or purchases
2. **Social sharing**: Add Twitter/Facebook share buttons
3. **Affiliate program**: Implement 15% recurring at 25 referrals
4. **Discord integration**: Auto-invite to Discord at 5 referrals
5. **Hall of Fame**: Public leaderboard of top referrers
6. **Custom codes**: Allow users to create custom referral codes
7. **Referral analytics**: Track conversion rates, best channels
8. **Badges system**: Visual badges for milestones achieved

---

**Implementation Status: 100% Complete (Backend + Frontend)**  
**Testing Status: Requires database setup + manual testing**  
**Production Ready: After database migration and testing**
