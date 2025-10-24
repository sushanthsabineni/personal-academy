# Google SSO Integration

## Overview
Google Sign-In has been integrated into the Personal Academy authentication system. When users sign in with Google, the app automatically captures their name, email, and profile picture.

## Features
- **One-Click Sign-In**: Users can authenticate with their Google account
- **Automatic Profile Capture**: Name, email, and profile picture are automatically retrieved
- **Profile Display**: User's Google profile picture appears in the header avatar
- **Persistent Sessions**: User info is stored in localStorage and persists across sessions

## Files Modified

### 1. `lib/auth.ts`
Added user info management:
- `UserInfo` interface with name, email, picture, authProvider
- `login()` now accepts optional userInfo parameter
- `getUserInfo()` retrieves stored user profile
- `updateUserInfo()` updates user profile
- `logout()` clears both auth token and user info

### 2. `lib/google-auth.ts` (NEW)
Google OAuth utilities:
- `loadGoogleScript()` - Loads Google Sign-In SDK
- `initializeGoogleSignIn()` - Initializes OAuth flow
- `renderGoogleButton()` - Renders Google Sign-In button
- `decodeJWT()` - Decodes Google JWT token to extract user info
- `GoogleUserInfo` interface for Google profile data

### 3. `app/auth/page.tsx`
Authentication page updates:
- Imports Google auth utilities
- Initializes Google Sign-In on component mount
- Renders Google Sign-In button above email/password form
- Handles OAuth callback automatically
- Stores user profile on successful sign-in

### 4. `components/layout/Header.tsx`
Header component updates:
- Imports `getUserInfo()` from auth
- Retrieves user profile from localStorage
- Displays actual user name from profile
- Shows Google profile picture in avatar (or initials as fallback)
- Uses Next.js `Image` component for optimized image loading

## User Flow

### Google SSO Flow:
1. User clicks "Sign in with Google" button
2. Google OAuth consent screen opens
3. User grants permission
4. OAuth callback returns JWT with user profile
5. JWT is decoded to extract: name, email, picture
6. User info is stored in localStorage
7. User is redirected to dashboard
8. Header displays user's name and profile picture

### Email/Password Flow:
1. User enters email and password
2. User clicks "Sign In" or "Create Account"
3. Basic user info is created from email
4. User is redirected to dashboard
5. Header displays user's initials (no profile picture)

## Data Structure

### UserInfo (localStorage key: 'userInfo')
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://lh3.googleusercontent.com/...",
  "authProvider": "google"
}
```

### Google JWT Payload
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "email": "john@example.com",
  "picture": "https://lh3.googleusercontent.com/...",
  "email_verified": true
}
```

## Production Setup

For production deployment, you need to:

1. **Create Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Add authorized JavaScript origins (e.g., https://yourapp.com)
   - Add authorized redirect URIs
   - Copy the Client ID

2. **Update Client ID**:
   - Open `lib/google-auth.ts`
   - Replace `GOOGLE_CLIENT_ID` with your actual client ID
   - Or use environment variable: `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`

3. **Environment Variables** (recommended):
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

4. **Update google-auth.ts** to use env variable:
   ```typescript
   export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'fallback-client-id'
   ```

## Current Status

✅ Google Sign-In button integrated
✅ OAuth flow implemented
✅ User profile capture (name, email, picture)
✅ Profile storage in localStorage
✅ Header displays real user name
✅ Header displays Google profile picture
✅ Fallback to initials when no picture
✅ Email/password auth still supported

## Testing

1. Start dev server: `npm run dev`
2. Navigate to `/auth`
3. Click "Sign in with Google" button
4. Complete Google OAuth consent
5. Verify redirect to dashboard
6. Check header displays your Google name and picture
7. Refresh page - verify profile persists
8. Click avatar - verify dropdown shows correct email

## Notes

- The current implementation uses a placeholder Google Client ID for development
- In production, replace with your actual OAuth credentials
- Google profile pictures are served from Google's CDN
- Images use Next.js `Image` component with `unoptimized` flag for external URLs
- User can still sign in with email/password (mock auth for development)
- Both auth methods store user info in the same format
- Auth provider is tracked ('google' vs 'email') for future use
