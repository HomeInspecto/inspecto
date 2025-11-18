# Vercel Deployment Setup

## Project Structure

This project uses **GitHub Actions** to build and deploy to Vercel. The build happens in GitHub Actions, not in Vercel.

## Environment Variables

Since the build happens in GitHub Actions, environment variables must be set as **GitHub Secrets**, not in Vercel dashboard.

### Required Steps:

1. **Set Environment Variable in GitHub Secrets**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `EXPO_PUBLIC_API_URL`
   - Value: Your backend API URL (e.g., `https://your-backend.railway.app`)
   - Click "Add secret"

2. **The GitHub Actions workflow will automatically**:
   - Use the `EXPO_PUBLIC_API_URL` secret during the build
   - Embed it into the Expo web export
   - Deploy the built files to Vercel

3. **After adding the secret**:
   - Push a new commit or manually trigger the workflow
   - The workflow will rebuild with the new environment variable

### Troubleshooting:

- **Variable not picked up**: Check Vercel build logs to see if the variable is available during build
- **Still using localhost**: The variable might not be set, or the build didn't pick it up - check the console logs in the browser
- **Build fails**: Ensure `app.config.js` exists (not just `app.json`) - Expo needs the JS config to read env vars dynamically

### Debug:

The code includes console logging to help debug:
- Check browser console for "Environment check" log
- Check "API URL:" log to see what URL is being used

