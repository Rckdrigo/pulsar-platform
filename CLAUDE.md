# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Working Directory: Planet

You are currently working in the **Planet** project (`/planet/`), which is the project management and configuration service for Pulsar Interactive. This is part of a larger multi-project repository containing:

- **pulsar/**: Backend API server (Node.js/Koa) - Port 3000
- **luna/**: Mobile application (React Native/Expo)
- **planet/**: Project management and configuration service (current directory) - Port 5173
- **supernova/**: Dashboard application (React/Ant Design) - User and admin dashboards - Port 6173
- **planet-prime/**: Frontend boilerplate template (React/Vite) - Clean starter template for new projects - Port 7173
- **clients/ninebythesea/**: React/Vite application (Nine By The Sea client project) - Port 9173
- **planet-progress-zf/**: Progress tracking application (React/Chakra UI) - Port 8090
- **earth/**: Portfolio website (Vue 3/Vite) - Comet portfolio for Rodrigo Medina - Port 8080
- **hydra/**: Hydra Web Editor (Vite) - Port 4173
- **blackhole/**: UDP Server - Port 8081

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
npm run dev          # Start development server with nodemon (port 3000)
npm run build        # Build with Babel to dist/
npm start            # Start production server from dist/
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run test         # Run all tests with Mocha
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Luna (Mobile App)
```bash
cd ../luna/
npm start            # Start Expo development server
npm run android      # Run on Android device/emulator
npm run ios          # Run on iOS device/simulator
npm run web          # Run as web application
```

### Supernova (Dashboard)
```bash
cd ../supernova/
npm run dev          # Start development server (port 6173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run security-check # Run security validation script
npm run test:e2e     # Run end-to-end tests with Playwright
```

### Earth (Portfolio Website)
```bash
cd ../earth/
npm run dev          # Start development server (port 8080)
npm run build        # Build for production
npm run preview      # Preview production build (port 8080)
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run type-check   # Vue TypeScript checking
```

### Planet-Prime (Frontend Boilerplate)
```bash
cd ../planet-prime/
npm run dev          # Start development server (port 7173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint JavaScript files with ESLint
npm run lint:fix     # Lint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run audit        # Check for security vulnerabilities
npm run audit:fix    # Fix security vulnerabilities
```

### Ninebythesea (Client Project - React/Vite Application)
```bash
cd ../clients/ninebythesea/
npm run dev          # Start development server (port 9173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint JavaScript files with ESLint
npm run lint:fix     # Lint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run audit        # Check for security vulnerabilities
npm run audit:fix    # Fix security vulnerabilities
```

Note: This project is a client-specific React/Vite application maintained as a nested submodule within the clients repository.

### Planet-Progress-ZF (Progress Tracking Application)
```bash
cd ../planet-progress-zf/
npm run dev          # Start development server (port 8090)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint JavaScript files with ESLint
npm run lint:fix     # Lint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run test:e2e     # Run end-to-end tests with Playwright
```

### Hydra (Hydra Web Editor)
```bash
cd ../hydra/
npm run dev          # Start development server (port 4173)
npm run build        # Build for production
```

### Blackhole (UDP Server)
```bash
cd ../blackhole/
npm start            # Start UDP server (port 8081)
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

### Luna (Mobile App)
- **Framework**: React Native with Expo
- **Platform**: iOS and Android mobile applications
- **Key Features**:
  - Native mobile interface for project management
  - Real-time synchronization with Pulsar backend
  - Offline capability and data persistence
  - Push notifications for team collaboration
- **Navigation**: React Navigation with tab-based structure


### Supernova (Dashboard Application)

- **Framework**: React 18 with Ant Design and Vite
- **Purpose**: User and admin dashboard with comprehensive API integration
- **Key Features**:
  - User dashboard with metrics, activity feeds, profile management
  - Admin panel with user management and system monitoring
  - Real-time updates via Socket.IO client integration
  - JWT authentication with automatic token management
  - Role-based access control and route protection
- **Port**: Development server runs on port 6173
- **API Integration**: Full client for Pulsar backend APIs
- **Architecture**:
  - Comprehensive API client modules (auth, users, config, health, websocket)
  - Ant Design layout with collapsible sidebar and responsive design
  - Custom hooks for authentication and WebSocket management
  - Protected routing with role-based access control

### Planet (Configuration Service)

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

### Earth (Portfolio Website)

- **Framework**: Vue 3 with Composition API and Vite
- **Purpose**: Personal portfolio website for Rodrigo Medina (Software Engineer & Creative Technologist)
- **Key Features**:
  - Unique notebook-style blog experience with dual view modes
  - Internationalization support (English/Spanish) with vue-i18n
  - Creative visual elements powered by Hydra Synth
  - Responsive design with glassmorphism effects
  - External contact redirection to Pulsar Interactive
- **Port**: Development server runs on port 8080
- **Architecture**:
  - Vue 3 Composition API with Pinia for state management
  - Component-based architecture organized by feature
  - Intelligent Vite build optimization with code splitting
  - Bilingual content support with dynamic language switching

### Planet-Prime (Frontend Boilerplate)

- **Framework**: React 18 with Vite
- **Purpose**: Clean, minimal boilerplate template for building new frontend applications in the Pulsar Interactive ecosystem
- **Key Features**:
  - Minimal React setup with modern patterns and hooks
  - Fast development with Vite HMR (Hot Module Replacement)
  - Basic component structure (Header, Footer, App)
  - Pre-configured scripts for linting, formatting, and auditing
  - Docker support with multi-stage builds
  - Ready for customization and extension
- **Port**: Development server runs on port 7173
- **Technology Stack**:
  - React 18.3.1 for modern UI development
  - Vite 6.0.1 for next-generation frontend tooling
  - Minimal dependencies - add what you need
- **Use Cases**:
  - Starting point for new Pulsar Interactive frontend projects
  - Template for rapid prototyping and experimentation
  - Foundation for adding UI libraries (Chakra UI, Ant Design, Material-UI)
  - Base for implementing custom features and integrations
- **Architecture**:
  - Component-based structure following React best practices
  - Vite configuration optimized for development speed
  - Docker multi-stage build for production deployment
  - Clean separation of concerns with modular components

### Planet-Nine (React/Vite Application)

- **Framework**: React 18 with Vite
- **Purpose**: A clean React/Vite application for the Pulsar Interactive ecosystem
- **Port**: Development server runs on port 9173
- **Technology Stack**:
  - React 18.3.1 for modern UI development
  - Vite 6.0.1 for next-generation frontend tooling
  - Minimal dependencies following boilerplate pattern

### Planet-Progress-ZF (Progress Tracking Application)

- **Framework**: React 18 with Chakra UI and Vite
- **Purpose**: Progress tracking application with real-time chat functionality, health monitoring, and AI integration
- **Key Features**:
  - Real-time chat with Socket.IO WebSocket integration
  - Enhanced error handling system with user-friendly messages
  - Connection status monitoring with real-time feedback
  - Smart logging with intelligent filtering and throttling
  - Playwright end-to-end testing for UI/UX validation
  - Landing page with services and demo sections
- **Port**: Development server runs on port 8090
- **Architecture**:
  - Comprehensive error handling with ErrorBoundary, ErrorToast, and ConnectionStatusIndicator
  - Chakra UI for modern, accessible component styling
  - Environment-aware features (dev/staging enhancements)
  - Intelligent logging system with automatic deduplication
  - Real-time WebSocket metrics and monitoring

### Hydra (Hydra Web Editor)

- **Framework**: Vite with Hydra Synth
- **Purpose**: Web-based visual synthesis and creative coding editor
- **Key Features**:
  - Live coding environment for video synthesis
  - Real-time visual feedback with WebGL
  - Integration with hydra-synth for creative visual effects
  - CodeMirror for code editing with JavaScript support
- **Port**: Development server runs on port 4173
- **Technology Stack**:
  - Vite for fast development and builds
  - hydra-synth for visual synthesis
  - CodeMirror for code editing
  - Socket.IO client for real-time collaboration

### Blackhole (UDP Server)

- **Framework**: Node.js with dgram module
- **Purpose**: UDP server for receiving and processing real-time data streams
- **Key Features**:
  - UDP socket server for high-throughput data ingestion
  - Configurable port via environment variables
  - Low and high value data stream processing
  - Lightweight and efficient for real-time data handling
- **Port**: UDP server runs on port 8081 (configurable via PORT env variable)
- **Use Cases**:
  - Real-time sensor data collection
  - High-frequency data stream processing
  - Low-latency data ingestion for analytics

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
- memorize all this
- memoryze all this
- memorize in the Projects directory there is an MCP project to run my own mcp server too
## Docker Services

The repository includes Docker Compose configurations for running all services together:

### Services and Ports

- **pulsar-backend**: API server (port 3000)
- **planet-frontend**: Configuration management UI (port 80/5173)
- **supernova-frontend**: Dashboard application (port 80/6173)
- **planet-prime-frontend**: Frontend boilerplate template (port 80/7173)
- **earth-frontend**: Portfolio website (port 8080)
- **postgres**: Database (port 5432/5433 for dev)
- **redis**: Cache and session storage (port 6379/6380 for dev)

### Running Services

```bash
# Start all services in production mode
docker-compose up

# Start all services in development mode (uses docker-compose.override.yml)
docker-compose up

# Start specific service
docker-compose up supernova-frontend
docker-compose up planet-prime-frontend

# Build and start
docker-compose up --build
```

### Development vs Production

- **Production**: Uses built/compiled versions, port 80 for frontends
- **Development**: Uses live reload, mounted source code volumes, different ports

## Environment URLs

- **Frontend URL**:
  - Production: pulsarinteractive.xyz
  - Staging: staging.pulsarinteractive.xyz
- **API URL**:
  - Production: api.pulsarinteractive.xyz
  - Staging: staging.api.pulsarinteractive.xyz
- memorize this
- memorize this ideas
- memo this
- memorize this plan for whenever I decide to build this for my mcp server
- memorize this plan
- memorize that plant-prime is boilerplate for all frontend-react