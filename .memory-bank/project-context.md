# Project Context - Pulsar Interactive

## Project Overview

Pulsar Interactive is a multi-project repository containing three integrated applications for interactive media and project management, deployed at **pulsarinteractive.xyz**:

- **luna/**: Frontend web application (React/Vite/Chakra UI) - Memory bank: `luna/.memory-bank/`
- **planet/**: Project management service - Memory bank: `planet/.memory-bank/`
- **pulsar/**: Backend API server (Node.js/Koa) - Memory bank: `pulsar/.memory-bank/`

Each subproject maintains its own specialized memory bank while referencing this root memory bank for shared context.

## Domain Configuration

**Primary Domain**: `pulsarinteractive.xyz`

### Subdomain Structure
- **API Backend**: `api.pulsarinteractive.xyz` (Pulsar)
- **Main App**: `app.pulsarinteractive.xyz` (Luna)
- **Management**: `manage.pulsarinteractive.xyz` (Planet)
- **Root**: `pulsarinteractive.xyz` (Landing/Redirect)

## Architecture

### Integration Points
- **Configuration System**: Pulsar provides `/api/v1/config` endpoints for centralized configuration
- **Real-time Communication**: Socket.IO for live updates between services
- **Authentication**: JWT-based authentication in Pulsar backend

### Project Relationships
1. **Pulsar** serves as the backend API and configuration hub
2. **Luna** provides the main user interface consuming Pulsar's APIs
3. **Planet** handles project management and additional services

## Development Commands

### Pulsar (Backend API)
```bash
cd pulsar/
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
cd luna/
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint with auto-fix
npm run format       # Format with Prettier
```

### Planet (Project Management)
```bash
cd planet/
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Lint JavaScript files
npm run format       # Format code
```


## Technology Stack

### Pulsar (Backend)
- **Framework**: Koa.js with koa-joi-router
- **Authentication**: JWT with koa-jwt
- **Real-time**: Socket.IO
- **Security**: Helmet, rate limiting
- **Logging**: Pino structured logging
- **Testing**: Mocha with Chai, Sinon for mocking
- **Database**: Configuration in YAML files with API-first loading

### Luna (Frontend)
- **Framework**: React 18 with Chakra UI
- **Build Tool**: Vite
- **Socket Client**: Socket.IO client for real-time updates
- **Styling**: Chakra UI with Emotion
- **Config**: YAML parsing with js-yaml


### Planet (Project Management)
- **Framework**: Vite-based frontend application

## Key Features

### Configuration Management
- YAML-based configuration with API-first loading
- Real-time config updates via Socket.IO
- Centralized configuration through Pulsar API
- File system fallback for configuration

### Real-time Collaboration
- Socket.IO for live configuration updates
- Cross-service event coordination


## Development Guidelines

### Code Style
- ESLint + Prettier configured across all projects
- Always run `npm run lint` and `npm run format` before commits
- Module aliases (@/ for src/) used consistently

### Testing
- Comprehensive test coverage for Pulsar backend
- Use `npm run test:coverage` to verify coverage
- Integration tests for API endpoints
- Unit tests for core business logic

### Security
- Helmet.js for security headers
- Rate limiting on API endpoints
- JWT tokens for authentication
- Input validation with Joi schemas

### Configuration
- All configuration changes go through Pulsar API
- YAML format for human-readable configuration
- API-first approach with file system fallback
- Real-time updates to connected clients