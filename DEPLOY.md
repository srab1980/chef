# Deployment Guide for Hostinger using Coolify

This guide explains how to deploy Chef on Hostinger using Coolify, a self-hosted deployment platform.

## Prerequisites

- A Hostinger VPS or hosting account with Docker support
- Coolify installed and configured on your server
- A Convex account with a project set up
- WorkOS OAuth application configured
- Domain name (optional but recommended)

## Overview

Chef is a full-stack web application built with:
- **Frontend**: Remix with React
- **Backend**: Convex (reactive database and backend)
- **Authentication**: WorkOS
- **Deployment**: Docker container via Coolify

## Step 1: Set Up Convex Project

1. Create a Convex project at [dashboard.convex.dev](https://dashboard.convex.dev)
2. Note your deployment URL (e.g., `https://your-deployment.convex.cloud`)
3. Configure environment variables in Convex dashboard (Settings → Environment Variables):
   ```
   BIG_BRAIN_HOST=https://api.convex.dev
   CONVEX_OAUTH_CLIENT_ID=<from OAuth setup>
   CONVEX_OAUTH_CLIENT_SECRET=<from OAuth setup>
   WORKOS_CLIENT_ID=<from WorkOS setup>
   ```

## Step 2: Set Up WorkOS OAuth Application

1. Go to the Convex [dashboard](https://dashboard.convex.dev/team/settings/applications/oauth-apps)
2. Create an OAuth application
3. Set redirect URI to your deployment domain (e.g., `https://yourdomain.com`)
4. Save the Client ID and Client Secret

## Step 3: Prepare Your Repository

1. Fork or clone the Chef repository:
   ```bash
   git clone https://github.com/get-convex/chef.git
   cd chef
   ```

2. Ensure the following files are present (they should be):
   - `Dockerfile` - Multi-stage Docker build configuration
   - `.dockerignore` - Files to exclude from Docker build
   - `docker-compose.yml` - Local testing configuration
   - `.env.example` - Template for required environment variables
   - `nixpacks.toml` - Alternative build configuration for Coolify
   - `.coolify` - Coolify configuration metadata (optional)

## Step 4: Configure Coolify

### 4.1 Connect Your Repository

1. Log in to your Coolify dashboard
2. Create a new project
3. Add a new resource → Docker Compose or Dockerfile
4. Connect your Git repository (GitHub, GitLab, etc.)
5. Select the branch you want to deploy (e.g., `main`)

### 4.2 Configure Build Settings

In Coolify, you have two options for building:

**Option 1: Using Dockerfile (Recommended)**
- **Build Pack**: Dockerfile
- **Dockerfile Location**: `./Dockerfile`
- **Port**: `3000`
- **Health Check Path**: `/api/health` (recommended)

**Option 2: Using Nixpacks**
- **Build Pack**: Nixpacks
- Coolify will automatically detect the `nixpacks.toml` configuration
- **Port**: `3000`
- **Health Check Path**: `/api/health` (recommended)

Both options will work. Dockerfile provides more control, while Nixpacks is simpler and may build faster.

### 4.3 Set Environment Variables

In Coolify's environment variables section, add the following required variables:

#### Required Variables:

```env
# Convex Configuration
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment

# WorkOS Authentication
VITE_WORKOS_CLIENT_ID=client_your_client_id
VITE_WORKOS_REDIRECT_URI=https://yourdomain.com
VITE_WORKOS_API_HOSTNAME=apiauth.convex.dev
WORKOS_CLIENT_ID=client_your_client_id

# Convex OAuth
BIG_BRAIN_HOST=https://api.convex.dev
CONVEX_OAUTH_CLIENT_ID=your_oauth_client_id
CONVEX_OAUTH_CLIENT_SECRET=your_oauth_client_secret

# Application
NODE_ENV=production
PORT=3000
```

#### Optional Variables (for AI providers):

```env
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
OPENAI_API_KEY=your_openai_key
XAI_API_KEY=your_xai_key
```

**Note**: You can also allow users to add their own API keys through the Chef settings page instead of setting them at the server level.

## Step 5: Deploy

1. In Coolify, click "Deploy" to start the deployment
2. Monitor the build logs to ensure everything builds correctly
3. Once deployed, Coolify will provide you with a URL or you can configure a custom domain

## Step 6: Configure Domain (Optional)

1. In Coolify, go to your application's settings
2. Add your custom domain
3. Enable SSL/TLS (Coolify can automatically provision Let's Encrypt certificates)
4. Update your WorkOS OAuth redirect URI to match your domain
5. Update the `VITE_WORKOS_REDIRECT_URI` environment variable in Coolify

## Step 7: Deploy Convex Backend

Even though the Chef application is running, you need to deploy the Convex backend:

```bash
# On your local machine
cd chef
npx convex dev --once
# Follow the prompts to connect to your Convex project

# Deploy to production
npx convex deploy --prod
```

## Testing the Deployment

1. Visit your deployed URL
2. Try logging in with your Convex account
3. Test creating a new project
4. Verify that AI code generation works (if API keys are configured)

## Troubleshooting

### Build Fails

- Check the Coolify build logs for specific errors
- Ensure all required environment variables are set
- Verify that the Dockerfile is accessible in your repository

### Authentication Issues

- Verify WorkOS OAuth settings match your deployment URL
- Check that `VITE_WORKOS_REDIRECT_URI` exactly matches the URI configured in WorkOS
- Ensure `WORKOS_CLIENT_ID` is set correctly

### Convex Connection Issues

- Verify `VITE_CONVEX_URL` is correct and accessible
- Ensure Convex backend is deployed (`npx convex deploy --prod`)
- Check Convex dashboard for any deployment errors

### Application Won't Start

- Check logs in Coolify dashboard
- Verify PORT environment variable is set to 3000
- Ensure the build completed successfully
- Check that all required environment variables are set (see `.env.example`)
- Verify Node.js version compatibility (requires Node.js 20+)

### Docker Build Fails with "pnpm not found"

- If using Dockerfile, ensure npm registry is accessible
- Try using the Nixpacks build option instead
- Check if there are any network/firewall issues blocking package downloads

### Health Check Failing

- Verify the application is listening on port 3000
- Check that `/api/health` endpoint is accessible
- Increase the health check start period if the build takes longer
- Review application logs for startup errors

## Local Testing with Docker

Before deploying to Coolify, you can test locally:

1. Copy `.env.example` to `.env.local` and fill in your values
2. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Visit `http://localhost:3000`

## Updating the Deployment

### Manual Deployment

1. Push changes to your Git repository
2. In Coolify, trigger a new deployment manually
3. Monitor the deployment logs
4. If Convex schema changes, deploy Convex backend: `npx convex deploy --prod`

### Automatic Deployment (Recommended)

Coolify can automatically deploy when you push to your repository:

1. In Coolify, enable "Auto Deploy" for your application
2. Select the branch to watch (e.g., `main`)
3. Coolify will automatically deploy on every push to that branch

### CI/CD with GitHub Actions (Optional)

For more control over deployments, you can use GitHub Actions:

1. Get your Coolify webhook URL from the application settings
2. Add it as a secret in your GitHub repository (`COOLIFY_WEBHOOK_URL`)
3. Copy `.github/workflows/coolify-deploy.yml.example` to `.github/workflows/coolify-deploy.yml`
4. Customize the workflow as needed
5. Push changes to trigger automated deployments

## Security Considerations

- Keep your environment variables secure and never commit them to Git
- Use strong secrets for OAuth credentials
- Enable HTTPS/SSL for production deployments
- Regularly update dependencies for security patches
- Consider setting up monitoring and alerting

## Additional Resources

- [Chef Documentation](https://docs.convex.dev/chef)
- [Convex Documentation](https://docs.convex.dev)
- [Coolify Documentation](https://coolify.io/docs)
- [WorkOS Documentation](https://workos.com/docs)

## Support

For issues specific to:
- **Chef**: Open an issue on the [GitHub repository](https://github.com/get-convex/chef/issues)
- **Coolify**: Check the [Coolify documentation](https://coolify.io/docs) or [Discord](https://discord.gg/coolify)
- **Hostinger**: Contact Hostinger support for VPS/hosting issues
