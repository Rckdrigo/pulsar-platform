# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Working Directory: Planet

You are currently working in the **Planet** project (`/planet/`), which is the project management and configuration service for Pulsar Interactive. This is part of a larger multi-project repository containing:

- **pulsar/**: Backend API server (Node.js/Koa)
- **luna/**: Frontend web application (React/Vite)
- **planet/**: Project management and configuration service (current directory)

## Planet Development Commands

```bash
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint JavaScript files with ESLint
npm run lint:fix     # Lint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run security-check # Run security validation script
npm run audit        # Check for security vulnerabilities
npm run audit:fix    # Fix security vulnerabilities
```

## Other Projects in Repository

### Pulsar (Backend API)
```bash
cd ../pulsar/
npm run dev          # Start development server with nodemon
npm run build        # Build with Babel to dist/
npm start            # Start production server from dist/
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run test         # Run all tests with Mocha
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Luna (Frontend)
```bash
cd ../luna/
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint with auto-fix
npm run format       # Format with Prettier
```


## Architecture Overview

### Pulsar (Backend)
- **Framework**: Koa.js with koa-joi-router
- **Architecture**: REST API with Socket.IO for real-time features
- **Key Features**:
  - Configuration management API (/api/v1/config)
  - JWT authentication with koa-jwt
  - Rate limiting and security with helmet
  - Structured logging with pino
- **Database**: Configuration stored in YAML files with API-first loading
- **Testing**: Mocha with Chai assertions, Sinon for mocking

### Luna (Frontend)
- **Framework**: React 18 with Chakra UI
- **Build Tool**: Vite
- **Key Features**:
  - Socket.IO client for real-time updates
  - Configuration management interface
  - YAML parsing with js-yaml
- **Styling**: Chakra UI with Emotion


### Planet (Current Project)
- **Framework**: React 18 with Chakra UI and Vite
- **Purpose**: Configuration management and real-time chat interface
- **Key Features**:
  - Real-time chat with WebSocket integration via socket.io-client
  - Configuration management with API-first loading and file fallback
  - Dark/light mode with OS preference detection
  - Authentication system integration
  - Security validation and audit tools
- **Port**: Development server runs on port 5173
- **Configuration**: YAML-based config system with template files
- **Architecture**:
  - ConfigContext provides centralized configuration state management
  - Layout-based component structure with resizable sidebars
  - Custom hooks for authentication, health checks, and WebSocket management
  - Built-in security validation script

## Key Integration Points

### Configuration System
- Pulsar provides `/api/v1/config` endpoints for centralized configuration
- Luna and Planet consume configuration API for frontend settings
- YAML-based configuration with API-first loading and file fallback
- Real-time config updates via Socket.IO
- Planet includes ConfigContext for React state management
- Configuration validation and security checking built-in

### Authentication
- JWT-based authentication in Pulsar backend
- Token-based API access between services
- Rate limiting and security headers configured

### Real-time Communication
- Socket.IO used for live configuration updates
- Cross-service event coordination

## Development Guidelines

### Code Style
- ESLint + Prettier configured across all projects
- Use `npm run lint` and `npm run format` before commits
- Consistent import patterns using module aliases (@/ for src/)

### Testing
- Comprehensive test coverage expected for Pulsar backend
- Use `npm run test:coverage` to verify coverage
- Integration tests for API endpoints
- Unit tests for core business logic

### Configuration Management
- All configuration changes should go through Pulsar API
- YAML format for human-readable configuration
- API-first approach with file system fallback
- Real-time updates to connected clients

### Security
- Helmet.js configured for security headers
- Rate limiting on API endpoints
- JWT tokens for authentication
- Input validation with Joi schemas
- Automated security checking with `npm run security-check`
- Configuration file validation to prevent hardcoded secrets
- Regular dependency auditing with `npm audit`

## Project Relationships

The projects are designed to work together as a cohesive system:
1. **Pulsar** serves as the backend API and configuration hub
2. **Luna** provides the main user interface consuming Pulsar's APIs
3. **Planet** handles configuration management and real-time chat functionality

Future development focuses on tighter integration between services, enhanced real-time collaboration, and comprehensive admin interfaces for configuration management.

## Planet-Specific Development Notes

### Component Architecture
- **Layout System**: Hierarchical layout with `Layout.jsx` orchestrating Header, Footer, MainContent, and resizable sidebars
- **Chat System**: Modular chat components with real-time WebSocket integration
- **Configuration Management**:
  - `ConfigContext.jsx` provides centralized state management
  - `configApi.js` service for API communication
  - `configLoader.js` utility for YAML configuration loading
- **Custom Hooks**:
  - `useAuth.jsx` for authentication
  - `useHealthCheck` for monitoring system health
  - WebSocket management hooks for real-time features

### Security Features
- **Security Script**: `scripts/security-check.js` validates environment and configuration
- **Configuration Validation**: Prevents hardcoded secrets in config files
- **Git Security**: Ensures sensitive files are properly ignored
- **ESLint Configuration**: Modern flat config with React and security rules

### Development Environment
- **Vite Configuration**: Custom setup with config directory alias and YAML asset support
- **Port**: Development server on 5173
- **File System**: Config directory accessible for imports
- **Module Resolution**: Path aliases configured for clean imports
- add this plan to the memory