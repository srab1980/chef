# Quick Start: Deploy to Hostinger with Coolify

This is a condensed version of the deployment guide. For detailed instructions, see [DEPLOY.md](./DEPLOY.md).

## Prerequisites Checklist

- [ ] Hostinger VPS with Coolify installed
- [ ] Convex project created at [dashboard.convex.dev](https://dashboard.convex.dev)
- [ ] WorkOS OAuth application configured
- [ ] Domain name (optional)

## Environment Variables (Required)

Copy these from `.env.example` and fill in your values:

```env
# Convex
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment

# WorkOS Auth
VITE_WORKOS_CLIENT_ID=client_xxxxx
VITE_WORKOS_REDIRECT_URI=https://yourdomain.com
VITE_WORKOS_API_HOSTNAME=apiauth.convex.dev
WORKOS_CLIENT_ID=client_xxxxx

# Convex OAuth
BIG_BRAIN_HOST=https://api.convex.dev
CONVEX_OAUTH_CLIENT_ID=your_oauth_id
CONVEX_OAUTH_CLIENT_SECRET=your_oauth_secret
```

## Coolify Setup Steps

1. **Create New Resource** in Coolify
   - Choose: Git Repository
   - Connect your Chef repository
   - Select branch (e.g., `main`)

2. **Build Configuration**
   - Build Pack: **Dockerfile** (or Nixpacks)
   - Port: **3000**
   - Health Check: **/api/health**

3. **Add Environment Variables**
   - Paste all required variables from above
   - Add optional AI API keys if desired

4. **Deploy**
   - Click "Deploy"
   - Monitor build logs
   - Wait for deployment to complete

5. **Configure Domain** (Optional)
   - Add custom domain in Coolify
   - Enable SSL/TLS
   - Update `VITE_WORKOS_REDIRECT_URI` to match

6. **Deploy Convex Backend**
   ```bash
   cd chef
   npx convex deploy --prod
   ```

## Quick Test

1. Visit your deployment URL
2. Log in with Convex account
3. Create a test project
4. Verify functionality

## Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check logs, verify all env vars set |
| Can't log in | Verify WorkOS redirect URI matches exactly |
| No Convex connection | Deploy backend: `npx convex deploy --prod` |
| Health check fails | Check port 3000 is exposed, app is running |

## Local Testing

```bash
# Copy and configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Build and run with Docker
docker-compose up --build

# Access at http://localhost:3000
```

## Need Help?

- Full guide: [DEPLOY.md](./DEPLOY.md)
- Chef docs: [docs.convex.dev/chef](https://docs.convex.dev/chef)
- Coolify docs: [coolify.io/docs](https://coolify.io/docs)
