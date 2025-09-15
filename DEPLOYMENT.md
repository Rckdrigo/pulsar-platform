# Deployment Guide for Pulsar Interactive

## Architecture Overview

- **Planet Frontend**: React/Vite app deployed to Vercel → `https://pulsarinteractive.xyz`
- **Pulsar Backend**: Node.js/Koa API deployed to Railway → `https://pulsar-api.railway.app`
- **CI/CD**: GitHub Actions for automated testing and deployment

## Environment Configuration

### Pulsar Backend Environment Variables

Copy the appropriate `.env.*` file to `.env` for your environment:

#### Required Environment Variables:

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `NODE_ENV` | Environment mode | `development` | `staging` | `production` |
| `PORT` | Server port | `3000` | `3000` | `3000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` | `https://staging-pulsarinteractive.xyz` | `https://pulsarinteractive.xyz` |
| `CORS_CREDENTIALS` | Allow credentials | `true` | `true` | `true` |
| `JWT_SECRET` | JWT signing secret | Dev secret | **CHANGE IN STAGING** | **CHANGE IN PRODUCTION** |
| `LOG_LEVEL` | Logging level | `debug` | `info` | `info` |
| `SOCKET_CORS_ORIGIN` | Socket.IO CORS origin | `http://localhost:5173` | `https://staging-pulsarinteractive.xyz` | `https://pulsarinteractive.xyz` |
| `SOCKET_CORS_CREDENTIALS` | Socket.IO credentials | `true` | `true` | `true` |
| `API_KEY` | API access key | Dev key | **CHANGE IN STAGING** | **CHANGE IN PRODUCTION** |

#### Optional Environment Variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `HAS_DB` | Enable database checks | `false` |
| `DATABASE_URL` | Database connection string | None |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Planet Frontend Environment Variables

All frontend environment variables must be prefixed with `VITE_`:

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `VITE_NODE_ENV` | Environment mode | `development` | `production` |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000` | `https://pulsar-api.railway.app` |
| `VITE_API_VERSION` | API version | `v1` | `v1` |
| `VITE_SOCKET_URL` | Socket.IO server URL | `http://localhost:3000` | `https://pulsar-api.railway.app` |
| `VITE_API_KEY` | API access key | Dev key | **CHANGE IN PRODUCTION** |
| `VITE_ENABLE_CHAT` | Enable chat features | `true` | `true` |
| `VITE_ENABLE_CONFIG_MANAGEMENT` | Enable config management | `true` | `true` |
| `VITE_DEBUG_MODE` | Enable debug mode | `true` | `false` |

## Deployment Steps

### 1. Pulsar Backend to Railway

1. **Create Railway Project**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login to Railway
   railway login

   # Create new project
   railway create pulsar-backend
   ```

2. **Configure Environment Variables**:
   - Go to Railway dashboard
   - Add all production environment variables from `.env.production`
   - **IMPORTANT**: Generate secure values for:
     - `JWT_SECRET`
     - `API_KEY`

3. **Deploy**:
   ```bash
   cd pulsar/
   railway up
   ```

4. **Configure Custom Domain** (Optional):
   - In Railway dashboard, go to Settings → Domains
   - Add custom domain: `api.pulsarinteractive.xyz`

### 2. Planet Frontend to Vercel

1. **Connect GitHub Repository**:
   - Go to Vercel dashboard
   - Import your GitHub repository
   - Select `planet/` as root directory

2. **Configure Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

3. **Configure Environment Variables**:
   - Add all production environment variables from `.env.production`
   - **IMPORTANT**: Update `VITE_API_BASE_URL` with your Railway URL

4. **Configure Custom Domain**:
   - In Vercel dashboard, go to Domains
   - Add domain: `pulsarinteractive.xyz`
   - Configure DNS in AWS Route 53:
     ```
     Type: CNAME
     Name: pulsarinteractive.xyz
     Value: cname.vercel-dns.com
     ```

## CI/CD Setup

### GitHub Secrets Required

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### For Railway Deployment:
- `RAILWAY_TOKEN`: Railway API token
- `RAILWAY_TOKEN_STAGING`: Railway staging token (optional)

#### For Vercel Deployment:
- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

### Automated Deployment Triggers

- **Pulsar**: Deploys when changes are made to `pulsar/` directory
- **Planet**: Deploys when changes are made to `planet/` directory
- **Staging**: Automatically deploys on pull requests
- **Production**: Automatically deploys on push to `main` branch

## Security Checklist

### Before Production Deployment:

- [ ] Generate secure `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Generate secure `API_KEY` (use: `openssl rand -base64 32`)
- [ ] Update CORS origins to production domains only
- [ ] Verify all environment variables are set
- [ ] Test health check endpoints
- [ ] Run security audit: `npm audit`
- [ ] Test Socket.IO connections with production URLs

### AWS Route 53 DNS Configuration:

```
Record Type: CNAME
Name: pulsarinteractive.xyz
Value: cname.vercel-dns.com
TTL: 300

Record Type: CNAME
Name: api.pulsarinteractive.xyz (if using custom Railway domain)
Value: [railway-provided-domain]
TTL: 300
```

## Monitoring & Health Checks

- **Health Endpoint**: `https://pulsar-api.railway.app/api/v1/health`
- **Frontend Health**: Built into Planet application
- **Logs**: Available in Railway and Vercel dashboards
- **Uptime Monitoring**: Set up external monitoring for health endpoints

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Verify `CORS_ORIGIN` matches frontend domain exactly
2. **Socket.IO Connection Failed**: Check `SOCKET_CORS_ORIGIN` configuration
3. **Build Failures**: Ensure Node.js version 22+ in deployment settings
4. **Environment Variables**: Verify all required variables are set
5. **Health Check Failures**: Check API key configuration

### Useful Commands:

```bash
# Check Railway logs
railway logs

# Test health endpoint locally
curl http://localhost:3000/api/v1/health

# Test production health endpoint
curl https://pulsar-api.railway.app/api/v1/health

# Build Planet locally
cd planet && npm run build

# Test Pulsar locally
cd pulsar && npm run dev
```