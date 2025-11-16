# AI Enhance Credits - Quick Reference Guide

## What Was Added

The "AI Enhance" button under Learning Outcomes now costs **25 credits** and is fully integrated with your user credit system.

## How It Works

### User sees:
1. **AI Enhance button** with a **"25"** credit badge next to it
2. When credits are available: Button is enabled (normal state)
3. When credits are insufficient: Button is disabled and shows in red

### When user clicks:
1. **Validation**: Check user has ≥ 25 credits
2. **If sufficient**: 
   - Call AI service to enhance outcomes
   - Deduct 25 credits from user balance
   - Create audit transaction
   - Update UI with new outcomes
3. **If insufficient**:
   - Show error: "Need 25 credits but have X"
   - Don't deduct any credits
   - Button stays disabled (red)

## Code Changes Summary

### 1. Component: `components/create/AIOutcomesPanel.tsx`
- Added `ENHANCE_CREDITS_COST = 25` constant
- New props: `userCredits`, `onCreditsUpdate`
- Validates credits before API call
- Enhanced button UI with credit badge
- Error messages for insufficient credits
- Tooltips showing credit requirements

### 2. Page: `app/create/essentials/page.tsx`
- Added `userCredits` state variable
- New useEffect to fetch user's `credits_balance` from `profiles` table
- Pass `userCredits` and `onCreditsUpdate` to AIOutcomesPanel
- Credits update automatically after successful enhancement

### 3. API: `app/api/course/enhance-outcomes/route.ts`
- Check user has enough credits (≥ 25)
- Return HTTP 402 if insufficient
- Deduct 25 credits from `profiles.credits_balance`
- Create transaction record in `credits_transactions` table
- Return `newCreditsBalance` in response

## Files Modified

| File | Changes |
|------|---------|
| `components/create/AIOutcomesPanel.tsx` | UI + credit validation |
| `app/create/essentials/page.tsx` | Credit state + fetch + pass to component |
| `app/api/course/enhance-outcomes/route.ts` | Backend credit deduction + transaction logging |

## Database Integration

### Tables Used
1. **profiles** - User's `credits_balance` column
2. **credits_transactions** - Audit trail of credit usage

### New Transaction Type
- `transaction_type: 'ai_enhance_outcomes'`
- `amount: -25`
- `description: 'AI Learning Outcomes Enhancement'`

## Testing

### Manual Test
1. Go to essentials page
2. Click AI Enhance button
3. Check:
   - Credits are deducted by 25
   - Transaction is created in credits_transactions
   - User balance updates in UI
   - Error shows if insufficient credits

### API Test (curl)
```bash
curl -X POST http://localhost:3000/api/course/enhance-outcomes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "courseTitle": "Test",
    "targetAudience": "Users",
    "knowledgeLevel": "Intermediate",
    "duration": 30,
    "methodology": "addie",
    "approxModules": "3-5",
    "approxLessonsPerModule": "2-3",
    "existingOutcomes": ""
  }'
```

Expected responses:
- 402: Insufficient credits
- 200: Success with `newCreditsBalance` in response

## Button States

| State | Appearance | Behavior |
|-------|-----------|----------|
| Normal (≥25 credits) | Gray with "25" badge | Clickable, calls API |
| Insufficient (<25 credits) | Red with "25" badge, disabled | Disabled, shows error |
| Loading | Blue with spinning icon | Disabled, shows "Enhancing..." |
| Success | Returns to normal | Updates form with results |

## What Happens Behind the Scenes

1. **Client Side**:
   - Loads user's current credit balance
   - Shows/hides button based on credits
   - Calls API with form data

2. **Server Side**:
   - Authenticates user
   - Validates credits (402 if insufficient)
   - Calls AI service
   - Deducts 25 credits
   - Creates transaction record
   - Returns new balance

3. **Database**:
   - Updates `profiles.credits_balance` (decremented by 25)
   - Inserts row in `credits_transactions` (type: ai_enhance_outcomes)

## Error Scenarios

| Scenario | Response | Credits Deducted |
|----------|----------|------------------|
| User not authenticated | 401 Unauthorized | No |
| Insufficient credits | 402 Payment Required | No |
| AI service fails | 400+ error | No |
| Success | 200 OK | Yes (-25) |

## Security

✅ Server-side validation (not client-side)
✅ User authentication required
✅ Atomic transactions (credit + record together)
✅ Audit trail of all usage
✅ Proper error codes (402 for payment issues)

## Deployment

No database migrations needed - uses existing schema.

Just deploy the three files and users can start using AI Enhance!

---

**Status:** ✅ Ready to test
**Build:** ✅ Successful (33.0s)
**Page:** ✅ Loaded

