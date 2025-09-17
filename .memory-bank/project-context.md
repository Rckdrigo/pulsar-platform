# Unified Context - Pulsar Interactive

## Executive Summary

Pulsar Interactive is an integrated multi-project system for interactive media and configuration management, deployed at **pulsarinteractive.xyz**. The system consists of three specialized services working together through centralized APIs and real-time communication.

**Core Projects:**
- **pulsar/**: Backend API hub (Node.js/Koa) - Configuration, Auth, Real-time
- **luna/**: Primary web interface (React/Vite/Chakra UI) - User-facing application
- **planet/**: Management service (React/Vite) - Project management and admin tools

## System Architecture

### Service Integration
```
┌─────────────┐    API/Socket.IO    ┌─────────────┐
│    Luna     │◄──────────────────►│   Pulsar    │
│ (Frontend)  │                    │ (Backend)   │
└─────────────┘                    └─────────────┘
       ▲                                  ▲
       │            Planet                │
       │         (Management)             │
       └──────────────┬───────────────────┘
                      │
              Shared Configuration
```

**Key Integration Points:**
- **Configuration API**: Centralized YAML-based config with API-first loading
- **Real-time Updates**: Socket.IO for live synchronization across services
- **Authentication**: JWT-based auth with secure token management
- **Deployment**: Subdomain-based service routing on pulsarinteractive.xyz

### Domain Structure
- `api.pulsarinteractive.xyz` → Pulsar (Backend API)
- `app.pulsarinteractive.xyz` → Luna (Main Application)
- `manage.pulsarinteractive.xyz` → Planet (Management Interface)
- `pulsarinteractive.xyz` → Landing/Router

## Technical Foundation

### Core Patterns
- **API-First Configuration**: Pulsar `/api/v1/config` endpoints with YAML fallback
- **Real-time Sync**: Socket.IO events for live updates across all clients
- **Module Organization**: `@/` aliases, barrel exports, feature-based folders
- **Security**: Helmet.js, rate limiting, JWT auth, Joi validation
- **Testing**: Mocha/Chai for backend, comprehensive coverage requirements

### Development Standards
- **Code Quality**: ESLint + Prettier across all projects
- **Pre-commit**: `npm run lint` and `npm run format` required
- **Testing**: Backend coverage via `npm run test:coverage`
- **Configuration**: YAML format, API-first with file fallback

## Memory Bank Organization

Each service maintains specialized documentation while referencing this unified context:

- **Root** (`.memory-bank/`): Cross-project patterns and integration context
- **Pulsar** (`pulsar/.memory-bank/`): Backend API, auth, and configuration specifics
- **Luna** (`luna/.memory-bank/`): Frontend patterns, UI components, and user flows
- **Planet** (`planet/.memory-bank/`): Management tools and admin interface patterns

*Refer to CLAUDE.md for complete development commands and project-specific guidance.*