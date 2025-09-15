# Project Context - Luna (Frontend)

## Application Overview

Luna is the primary frontend web application for Pulsar Interactive, built with React 18, Vite, and Chakra UI. It serves as the main user interface consuming Pulsar's APIs and providing real-time interaction capabilities.

**Production Domain**: `app.pulsarinteractive.xyz`

## Architecture

### Frontend Stack
- **Framework**: React 18 with functional components and hooks
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Chakra UI for consistent design system
- **Styling**: Emotion (via Chakra UI) for CSS-in-JS
- **Real-time**: Socket.IO client for live updates
- **Configuration**: js-yaml for YAML parsing

### Integration Points
- **Pulsar API**: Consumes `https://api.pulsarinteractive.xyz/api/v1/config` and other REST endpoints
- **Socket.IO**: Real-time communication with Pulsar backend at `wss://api.pulsarinteractive.xyz`
- **Configuration**: Receives configuration updates from Pulsar

## Development Commands

```bash
cd luna/
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint with auto-fix
npm run format       # Format with Prettier
```

## Project Structure

```
luna/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page-level components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── styles/        # Global styles and themes
│   └── config/        # Configuration management
├── public/            # Static assets
└── dist/             # Build output
```

## Key Features

### Real-time Configuration Updates
- Socket.IO client integration for live config changes
- Automatic UI updates when configuration changes
- Seamless synchronization with Pulsar backend

### Component Architecture
- Functional components with hooks
- Chakra UI design system integration
- Responsive design patterns
- Consistent theming and styling

### Configuration Management
- YAML configuration parsing and display
- Real-time configuration interface
- API-first configuration loading

## Development Guidelines

### Code Style
- ESLint + Prettier configured for React/JS best practices
- Functional components preferred over class components
- Custom hooks for reusable logic
- Module aliases (@/ for src/) for clean imports

### Component Patterns
- Use Chakra UI components consistently
- Implement responsive design with Chakra's responsive props
- Custom hooks for complex state logic
- Error boundaries for robust error handling

### State Management
- React Context for global state where needed
- Local component state for UI-specific data
- Socket.IO integration for real-time data

### Testing Strategy
- Component testing with React Testing Library
- Integration tests for key user flows
- Mock Socket.IO connections for testing

## Integration with Pulsar Interactive

Luna operates as part of the larger Pulsar Interactive ecosystem:
- Consumes Pulsar backend APIs for data and configuration
- Provides the primary user interface for the system
- Maintains real-time synchronization with backend services
- Follows shared development patterns and conventions