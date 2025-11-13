# Auth0 Integration Setup Guide

This guide will help you configure Auth0 for the Inspecto front-end application.

## Prerequisites

1. An Auth0 account (sign up at [auth0.com](https://auth0.com) if you don't have one)
2. A configured Auth0 Application

## Step 1: Create an Auth0 Application

1. Log in to your [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** > **Applications**
3. Click **Create Application**
4. Choose **Native** as the application type
5. Name your application (e.g., "Inspecto Mobile App")
6. Click **Create**

## Step 2: Configure Auth0 Application Settings

### Allowed Callback URLs

For Expo apps, the callback URL uses the scheme from `app.json`:

**Format:**
- `{SCHEME}://{AUTH0_DOMAIN}/callback`

**Example:**
If your Auth0 domain is `dev-ygw3azl7e0p8w1d5.us.auth0.com` and your scheme is `frontend` (from app.json), add:

- `frontend://dev-ygw3azl7e0p8w1d5.us.auth0.com/callback`

**For Expo Go (development only):**
- `exp://localhost:8081` (iOS)
- `exp://192.168.x.x:8081` (Android - replace with your local IP)

### Allowed Logout URLs

Add the same URLs as above:
- `frontend://YOUR_AUTH0_DOMAIN/callback`
- `exp://localhost:8081` (for Expo Go)

### Allowed Web Origins

Add your development and production origins:
- `http://localhost:8081`
- `https://your-production-domain.com`

### Advanced Settings > Grant Types

Ensure the following grant types are enabled:
- ✅ Authorization Code
- ✅ Refresh Token

## Step 3: Configure Environment Variables

Create a `.env` file in the `front-end` directory:

```env
EXPO_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
EXPO_PUBLIC_AUTH0_CLIENT_ID=your_client_id_here
```

**Important:** Replace:
- `your-tenant.auth0.com` with your Auth0 domain (found in Auth0 Dashboard > Settings)
- `your_client_id_here` with your Application's Client ID (found in your Auth0 Application settings)

Alternatively, you can set these in `app.json` under `extra`:

```json
"extra": {
  "auth0Domain": "your-tenant.auth0.com",
  "auth0ClientId": "your_client_id_here"
}
```

## Step 4: Configure Auth0 Universal Login (Optional)

If you want to customize the login experience:

1. Go to **Branding** > **Universal Login** in Auth0 Dashboard
2. Customize your login page theme and experience
3. Save your changes

## Step 5: Find Your Exact Callback URL

The app will automatically log the exact callback URL being used when you attempt to login. To find it:

1. Start your Expo development server:
   ```bash
   npm start
   ```

2. Open your app and attempt to login
3. Check the console/terminal output - you'll see a log message like:
   ```
   Auth0 Callback URL: com.inspecto.app://dev-ygw3azl7e0p8w1d5.us.auth0.com/ios/com.inspecto.app/callback
   Add this URL to Auth0 Dashboard > Applications > Your App > Allowed Callback URLs
   ```

4. Copy the exact URL from the console and add it to your Auth0 Application's **Allowed Callback URLs** field

## Step 6: Test the Integration

1. The app should redirect you to the login screen if you're not authenticated
2. Click "Sign In" to open Auth0's Universal Login
3. After successful authentication, you'll be redirected back to the app

## Troubleshooting

### Issue: "Invalid callback URL" or "Callback URL mismatch"

**Solution:** Make sure your callback URL is added to the Auth0 Application's **Allowed Callback URLs** list. The callback URL format should be:

**Format:**
```
{SCHEME}://{AUTH0_DOMAIN}/callback
```

**Example:**
```
frontend://dev-ygw3azl7e0p8w1d5.us.auth0.com/callback
```

**Important:** 
- Replace `YOUR_AUTH0_DOMAIN` with your actual Auth0 domain (found in Auth0 Dashboard > Settings)
- The callback URL must match exactly - use the scheme from your `app.json` (default is `frontend`)
- You can find the exact callback URL being used by checking the console output when you attempt to login

### Issue: "Failed to launch 'frontend://...' because the scheme does not have a registered handler"

**Solution:** This error occurs because you're running the app in Expo Go, which doesn't support custom URL schemes. You need to build a development build:

**Option 1: Build a Development Build (Recommended)**
```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

**Option 2: Use EAS Build**
```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Build a development build
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

After building a development build, the custom URL scheme (`frontend://`) will be properly registered and Auth0 callbacks will work.

**Note:** Expo Go doesn't support custom URL schemes, so deep linking will only work in development builds or production builds.

### Issue: "Connection error" or can't connect to Auth0

**Solution:** 
- Verify your Auth0 domain is correct
- Check your internet connection
- Ensure Auth0 domain is reachable

### Issue: App crashes on login

**Solution:**
- Check that all required packages are installed: `npm install`
- Verify environment variables are set correctly
- Check console logs for specific error messages
- Make sure you've built a development build (not using Expo Go)

### Issue: Web platform not working

**Note:** `react-native-auth0` has limited web support. For full web support, consider using `expo-auth-session` for web-specific authentication flows.

## API Integration

After authentication, the access token is available via the `useAuth` hook:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { accessToken, getAccessToken } = useAuth();
  
  const makeAuthenticatedRequest = async () => {
    const token = await getAccessToken();
    // Use token in Authorization header
    fetch('https://your-api.com/endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  };
}
```

## Additional Resources

- [Auth0 React Native SDK Documentation](https://github.com/auth0/react-native-auth0)
- [Auth0 Dashboard](https://manage.auth0.com/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

