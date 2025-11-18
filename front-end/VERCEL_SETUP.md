# Vercel Deployment Setup

## Environment Variables

For Expo web builds on Vercel, environment variables must be set in the Vercel dashboard and are embedded at **build time**.

### Required Steps:

1. **Set Environment Variable in Vercel Dashboard**:
   - Go to your Vercel project → Settings → Environment Variables
   - Add: `EXPO_PUBLIC_API_URL`
   - Value: Your backend API URL (e.g., `https://your-backend.railway.app`)
   - **Important**: Set it for **Production**, **Preview**, and **Development** environments
   - The variable name must be exactly `EXPO_PUBLIC_API_URL` (case-sensitive)

2. **Redeploy After Setting Variables**:
   - After adding/modifying environment variables, you **must** trigger a new deployment
   - Vercel will automatically rebuild, but you can also manually redeploy from the dashboard

3. **Verify Build Configuration**:
   - Root Directory: Should be `front-end` (if deploying from monorepo)
   - Build Command: `npm run build:web`
   - Output Directory: `web-build`
   - Install Command: `npm install`

### Troubleshooting:

- **Variable not picked up**: Check Vercel build logs to see if the variable is available during build
- **Still using localhost**: The variable might not be set, or the build didn't pick it up - check the console logs in the browser
- **Build fails**: Ensure `app.config.js` exists (not just `app.json`) - Expo needs the JS config to read env vars dynamically

### Debug:

The code includes console logging to help debug:
- Check browser console for "Environment check" log
- Check "API URL:" log to see what URL is being used

