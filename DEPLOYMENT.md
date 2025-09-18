# Deployment Guide

This document provides comprehensive deployment instructions for the Pulsar Interactive multi-project repository.

## Overview

- **Pulsar Backend**: Deployed on Railway (https://railway.app)
- **Planet Frontend**: Deployed on Vercel (https://vercel.com)

## Production URLs

- **Planet Frontend**: https://manage.pulsarinteractive.xyz
- **Pulsar Backend**: https://pulsar-api.railway.app

## Quick Start

### 1. Railway Setup for Pulsar Backend
```bash
cd pulsar/
railway login
railway init
railway add postgresql
npm run railway:check
```

### 2. Vercel Setup for Planet Frontend
Planet is already configured. Just connect your GitHub repo to Vercel.

### 3. Set GitHub Secrets
In your GitHub repository settings > Secrets and variables > Actions:
```
RAILWAY_TOKEN=your_railway_token
RAILWAY_PROJECT_ID=your_project_id
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### 4. Deploy
```bash
git push origin main  # Triggers automatic deployment
```

## Railway Environment Variables

Set these in your Railway dashboard:

### Required
```
NODE_ENV=production
PORT=3000
HAS_DB=true
```

### Optional
```
CORS_ORIGIN=https://manage.pulsarinteractive.xyz
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
WEBSOCKET_CORS_ORIGIN=https://manage.pulsarinteractive.xyz
```

## Vercel Environment Variables

Already configured in `vercel.json`. Key variables:
```
VITE_API_BASE_URL=https://pulsar-api.railway.app
VITE_SOCKET_URL=https://pulsar-api.railway.app
VITE_ENABLE_CHAT=true
```

## CI/CD Workflows

### Main Pipeline (`.github/workflows/ci-cd.yml`)
- Runs on main/develop branches
- Auto-deploys to production
- Includes tests and integration checks

### Development Pipeline (`.github/workflows/dev-workflow.yml`)
- Runs on feature branches and PRs
- Quick validation and testing
- Branch name validation

### Security Audit (`.github/workflows/security-audit.yml`)
- Weekly automated security scans
- Dependency updates via PRs
- Performance audits

## Health Checks

```bash
# Backend
curl https://pulsar-api.railway.app/api/v1/health

# Frontend
curl https://manage.pulsarinteractive.xyz
```

## Useful Commands

```bash
# Check Railway deployment status
railway status

# View Railway logs
railway logs

# Test deployment configuration
npm run railway:check

# Manual deployment (if needed)
railway up
```

## Troubleshooting

### Railway Issues
1. Check logs: `railway logs`
2. Verify environment variables
3. Ensure PostgreSQL addon is added

### Vercel Issues
1. Check build logs in Vercel dashboard
2. Verify environment variables
3. Test build locally: `npm run build`

### CI/CD Issues
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Ensure tests pass locally