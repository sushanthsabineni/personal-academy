# Razorpay Payment Integration Setup

Complete guide for setting up Razorpay payments in Personal Academy.

## 📋 Prerequisites

- Razorpay account (sign up at https://razorpay.com)
- Access to Razorpay Dashboard
- Supabase database with `payments`, `profiles`, and `credits_transactions` tables

## 🔑 Step 1: Get API Keys

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. Generate API keys for your environment:
   - **Test Mode**: Use for development/testing
   - **Live Mode**: Use for production (requires account activation)

## 🔧 Step 2: Configure Environment Variables

Add to `.env.local`:

```env
# Razorpay Keys (from Dashboard → Settings → API Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Webhook Secret (from Dashboard → Settings → Webhooks)
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Optional: N8N webhook for automation
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/payment-success
```

⚠️ **Security Note**: Never commit `.env.local` to version control!

## 🎯 Step 3: Set Up Webhooks

Webhooks notify your server about payment events automatically.

### Configure Webhook in Dashboard

1. Go to **Settings** → **Webhooks**
2. Click **Create New Webhook**
3. Configure:
   - **Webhook URL**: `https://your-domain.com/api/razorpay/webhook`
   - **Active Events**:
     - ✅ `payment.captured` - Payment successful
     - ✅ `payment.failed` - Payment failed
     - ✅ `refund.created` - Refund processed
4. Click **Create Webhook**
5. Copy the **Webhook Secret** and add to `.env.local`

### Test Webhook Locally (Development)

Use ngrok to expose localhost:

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Use the ngrok URL in Razorpay webhook settings
# Example: https://abc123.ngrok.io/api/razorpay/webhook
```

## 💳 Step 4: Test Payment Flow

### Test Cards (Test Mode Only)

Razorpay provides test cards for different scenarios:

| Card Number | Type | Result |
|------------|------|--------|
| `4111 1111 1111 1111` | Visa | Success |
| `5555 5555 5555 4444` | Mastercard | Success |
| `4000 0000 0000 0002` | Visa | Declined |

**Test Details**:
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

### Testing Steps

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Pricing Page**:
   ```
   http://localhost:3000/account/pricing
   ```

3. **Purchase Credits**:
   - Click "Get Started" on any tier
   - Payment modal opens
   - Click "Proceed to Payment"
   - Use test card details
   - Complete payment

4. **Verify Success**:
   - Check redirect to `/account/credits?payment=success`
   - Verify credits added to balance
   - Check Supabase tables:
     - `payments` - Payment record created
     - `credits_transactions` - Transaction logged
     - `profiles` - Credits balance updated

## 📊 API Endpoints

### 1. Create Order
**Endpoint**: `POST /api/payment/create-order`

**Request Body**:
```json
{
  "credits": 100,
  "amount": 999,
  "currency": "INR"
}
```

**Response**:
```json
{
  "orderId": "order_xxxxxxxxxxxxx",
  "amount": 99900,
  "currency": "INR",
  "key": "rzp_test_xxxxxxxxxxxxx"
}
```

### 2. Verify Payment
**Endpoint**: `POST /api/payment/verify`

**Request Body**:
```json
{
  "razorpay_order_id": "order_xxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxx",
  "razorpay_signature": "xxxxxxxxxxxxx"
}
```

**Response**:
```json
{
  "success": true,
  "credits": 100,
  "message": "100 credits added successfully!"
}
```

### 3. Webhook Handler
**Endpoint**: `POST /api/razorpay/webhook`

Automatically processes Razorpay events:
- `payment.captured` - Updates payment status to "captured"
- `payment.failed` - Marks payment as failed
- `refund.created` - Logs refund event

## 🗄️ Database Schema

### Required Tables

**payments**:
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  amount NUMERIC(10,2),
  currency TEXT,
  credits_purchased INTEGER,
  status TEXT, -- 'pending', 'completed', 'failed', 'captured'
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**credits_transactions**:
```sql
CREATE TABLE credits_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  amount INTEGER,
  type TEXT, -- 'purchase', 'usage', 'refund'
  description TEXT,
  balance_after INTEGER,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**profiles**:
```sql
-- Add these columns if they don't exist
ALTER TABLE profiles
ADD COLUMN credits_balance INTEGER DEFAULT 0,
ADD COLUMN credits_purchased INTEGER DEFAULT 0;
```

## 🔒 Security Best Practices

1. **Environment Variables**:
   - Never expose `RAZORPAY_KEY_SECRET` to client
   - Only `NEXT_PUBLIC_RAZORPAY_KEY_ID` is safe for frontend

2. **Signature Verification**:
   - Always verify Razorpay signature in backend
   - Use HMAC SHA256 with secret key
   - Prevents payment tampering

3. **Authentication**:
   - Verify user session before creating orders
   - Check user ownership before updating credits

4. **Webhook Security**:
   - Verify webhook signature
   - Use webhook secret from Razorpay dashboard
   - Log all webhook events

5. **Database Transactions**:
   - Store order in database before Razorpay checkout
   - Prevent duplicate credit additions
   - Use payment_id foreign key in transactions

## 🚀 Going Live

Before deploying to production:

1. **Switch to Live Mode**:
   - Get Live API keys from Razorpay Dashboard
   - Update `.env.local` with live keys
   - Update webhook URL to production domain

2. **Account Activation**:
   - Submit KYC documents to Razorpay
   - Wait for account activation (2-3 days)
   - Test with real payments

3. **Payment Gateway Activation**:
   - Enable payment methods (Cards, UPI, Netbanking)
   - Configure auto-settlements
   - Set up email notifications

4. **Compliance**:
   - Add Terms of Service link
   - Add Refund Policy
   - Display pricing clearly
   - Show all fees/charges

## 📈 Monitoring & Analytics

### Razorpay Dashboard

Monitor payments in real-time:
- **Payments** - View all transactions
- **Orders** - Track order status
- **Settlements** - Check payouts
- **Analytics** - Revenue reports

### Application Monitoring

Track in your app:
```typescript
// Log payment events
console.log('Payment initiated:', orderId)
console.log('Payment completed:', paymentId)

// Track with analytics
if (process.env.N8N_WEBHOOK_URL) {
  await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      event: 'payment_success',
      user_id: userId,
      amount: amount,
      credits: credits
    })
  })
}
```

## 🐛 Troubleshooting

### Payment Creation Fails

**Issue**: Order creation returns 500 error

**Solutions**:
- Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- Verify keys are for correct mode (test/live)
- Check amount is in smallest unit (paise/cents)
- Ensure currency is valid (INR, USD, GBP, etc.)

### Payment Verification Fails

**Issue**: Signature verification returns 400 error

**Solutions**:
- Verify `RAZORPAY_KEY_SECRET` matches dashboard
- Check signature generation uses correct format: `order_id|payment_id`
- Ensure HMAC SHA256 algorithm is used
- Log both signatures for comparison

### Webhook Not Receiving Events

**Issue**: Webhook endpoint not called

**Solutions**:
- Verify webhook URL is publicly accessible
- Check webhook is active in Razorpay dashboard
- Test webhook with Razorpay's "Send Test Webhook" button
- Verify webhook secret matches `.env.local`
- Check server logs for incoming requests

### Credits Not Added

**Issue**: Payment succeeds but credits not updated

**Solutions**:
- Check Supabase connection
- Verify user is authenticated
- Check `payments` table for record
- Review `credits_transactions` for entry
- Check console for database errors

## 📞 Support

- **Razorpay Support**: https://razorpay.com/support/
- **Razorpay Docs**: https://razorpay.com/docs/
- **Integration Guide**: https://razorpay.com/docs/payments/

## ✅ Checklist

Before going live:

- [ ] API keys configured in production
- [ ] Webhook URL updated to production domain
- [ ] Webhook secret added to environment
- [ ] Database tables created with proper indexes
- [ ] Test payments completed successfully
- [ ] Signature verification working
- [ ] Credits updating correctly
- [ ] Error handling tested
- [ ] Refund flow implemented
- [ ] Terms of Service added
- [ ] Refund policy published
- [ ] KYC documents submitted
- [ ] Account activated by Razorpay
- [ ] Live payment tested
- [ ] Monitoring/alerts set up

---

**Last Updated**: October 2025  
**Integration Version**: Razorpay SDK v2.9.6
