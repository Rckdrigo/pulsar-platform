# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is the **clients** repository within the Pulsar Interactive ecosystem. It serves as a dedicated space for client-specific projects and customizations built on top of the Pulsar Interactive platform.

## Repository Structure

```
clients/
├── acai/          # Client project directory
└── [future-client-projects]/
```

## Parent Repository Context

This repository exists within the larger Pulsar Interactive monorepo located at `/Users/rckdrigo/Projects/pulsar-interactive/`. The parent repository contains:

- **pulsar/**: Backend API server (Node.js/Koa) - Port 3000
- **planet/**: Configuration management service - Port 5173
- **supernova/**: Dashboard application - Port 6173
- **luna/**: Mobile application (React Native/Expo)
- **earth/**: Portfolio website (Vue 3) - Port 8080
- Other supporting services and applications

For comprehensive architecture details, development guidelines, and service integration points, refer to `/Users/rckdrigo/Projects/pulsar-interactive/CLAUDE.md`.

## Client Project Pattern

Each client project directory should follow this structure:

```
client-name/
├── package.json           # Project dependencies and scripts
├── README.md             # Client-specific documentation
├── src/                  # Source code
├── config/               # Client-specific configuration
└── [framework-specific-files]
```

## Development Workflow

### Starting a New Client Project

1. Create a new directory under `clients/` with the client name
2. Choose appropriate boilerplate from parent repository:
   - **planet-prime/**: React/Vite boilerplate for frontend projects
   - **pulsar/**: Backend API patterns
   - **supernova/**: Dashboard application patterns
3. Initialize with `npm init` or copy from boilerplate
4. Configure connection to Pulsar backend services
5. Document client-specific requirements in project README.md

### Integration with Pulsar Services

All client projects should integrate with the core Pulsar ecosystem:

- **Authentication**: Use JWT-based auth from Pulsar backend
- **Configuration**: Consume `/api/v1/config` endpoints
- **Real-time Features**: Connect via Socket.IO to Pulsar
- **API Base URL**:
  - Development: http://localhost:3000
  - Staging: staging.api.pulsarinteractive.xyz
  - Production: api.pulsarinteractive.xyz

### Common Commands (Per Client Project)

Client projects typically follow these npm script conventions:

```bash
cd client-name/
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Lint code
npm run format       # Format code with Prettier
npm test             # Run tests
```

Port allocation for client projects should start from 10000+ to avoid conflicts with core services.

## Code Style and Standards

Client projects should adhere to the same standards as the parent repository:

- **ESLint + Prettier**: Use consistent formatting
- **Module Aliases**: Use `@/` for src/ imports where applicable
- **Git Workflow**: Follow conventional commits
- **Security**: Never commit sensitive data (API keys, tokens, credentials)

## Dependencies on Core Services

### Required Services for Development

To develop client projects, ensure these core services are running:

```bash
# From parent directory: /Users/rckdrigo/Projects/pulsar-interactive/
cd ../pulsar/
npm run dev          # Backend API (required)
```

### Optional Services

Depending on client requirements, you may need:

```bash
cd ../planet/
npm run dev          # Configuration UI (port 5173)

cd ../supernova/
npm run dev          # Dashboard patterns/components (port 6173)
```

## Configuration Management

Client projects should:

1. Store environment-specific config in `.env` files (never commit these)
2. Use `.env.template` files to document required variables
3. Fetch runtime configuration from Pulsar `/api/v1/config` API
4. Follow YAML-based config patterns from parent repository

## Docker Support

Client projects can be dockerized following the pattern from parent services:

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
CMD ["npm", "start"]
```

## Testing

Client projects should include:

- **Unit Tests**: For business logic and utilities
- **Integration Tests**: For API interactions with Pulsar
- **E2E Tests**: Using Playwright (following supernova/planet-progress-zf patterns)

## Git Strategy

This repository has its own git history separate from the parent monorepo. This allows:

- Independent versioning of client projects
- Selective client code sharing
- Isolation of client-specific development
- Easier deployment of individual client projects

## Client Project Checklist

When creating a new client project, ensure:

- [ ] Project directory created with clear naming
- [ ] package.json with appropriate scripts
- [ ] README.md documenting purpose and setup
- [ ] .env.template with required variables
- [ ] .gitignore properly configured
- [ ] Connection to Pulsar backend tested
- [ ] Authentication flow implemented
- [ ] Error handling and logging configured
- [ ] Build and deployment process documented

## Current Client Projects

### Acai

Currently in kickoff phase. Details to be added as the project develops.

## Security Considerations

- Use JWT tokens from Pulsar for authentication
- Never store credentials in code or config files
- Use environment variables for sensitive data
- Follow OWASP security guidelines
- Regular `npm audit` for dependency vulnerabilities
- Implement rate limiting for client-side API calls

## Support and Resources

- Parent Repository CLAUDE.md: `/Users/rckdrigo/Projects/pulsar-interactive/CLAUDE.md`
- Pulsar API Documentation: Available through Pulsar service
- Frontend Boilerplate: `../planet-prime/`
- Backend Patterns: `../pulsar/`
- Dashboard Patterns: `../supernova/`
