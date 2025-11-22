# Planet Prime

**Frontend Boilerplate for Pulsar Interactive**

Planet Prime is a clean, minimal React + Vite boilerplate template designed to serve as the foundation for building new frontend applications in the Pulsar Interactive ecosystem.

## Purpose

This template provides:
- ✨ Clean React 18 setup with modern patterns
- ⚡ Vite for fast development and optimized builds
- 🎨 Basic component structure (Header, Footer, App)
- 🔧 Pre-configured scripts for linting, formatting, and auditing
- 📦 Minimal dependencies - add what you need

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 7173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 7173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint JavaScript files with ESLint |
| `npm run lint:fix` | Lint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run audit` | Check for security vulnerabilities |
| `npm run audit:fix` | Fix security vulnerabilities |

## Project Structure

```
planet-prime/
├── src/
│   ├── components/
│   │   ├── Header.jsx       # Example header component
│   │   ├── Header.css       # Header styles
│   │   ├── Footer.jsx       # Example footer component
│   │   └── Footer.css       # Footer styles
│   ├── App.jsx              # Main app component
│   ├── App.css              # App styles
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Project configuration
```

## Using as a Boilerplate

To create a new project from this template:

1. **Copy the directory:**
   ```bash
   cp -r planet-prime/ your-new-project/
   cd your-new-project/
   ```

2. **Update package.json:**
   - Change the `name` field
   - Update the `description` field
   - Modify `keywords` as needed

3. **Update configuration:**
   - Change the port in `vite.config.js` if needed
   - Update `index.html` title
   - Customize `.claude/settings.local.json` paths

4. **Install and start:**
   ```bash
   npm install
   npm run dev
   ```

5. **Start building:**
   - Add your UI library (e.g., Chakra UI, Ant Design, Material-UI)
   - Add routing (e.g., React Router)
   - Add state management (e.g., Redux, Zustand, Context API)
   - Add API integration
   - Customize components and styling

## Integration with Pulsar Interactive

This boilerplate is designed to integrate seamlessly with:
- **Pulsar Backend**: Node.js/Koa API server (port 3000)
- **Authentication**: JWT-based authentication
- **Real-time**: Socket.IO for WebSocket communication
- **Configuration**: API-first configuration management

## Technology Stack

- **React 18.3.1**: Modern React with hooks
- **Vite 6.3.5**: Next-generation frontend tooling
- **Development Port**: 7173

## Best Practices

- ✅ Always run `npm run lint:fix` and `npm run format` before commits
- ✅ Keep dependencies minimal - add only what you need
- ✅ Follow the component structure from existing Pulsar projects
- ✅ Use environment variables for configuration
- ✅ Run `npm audit` regularly to check for vulnerabilities

## Next Steps

After setting up your new project from this template, consider adding:

1. **UI Framework**: Chakra UI, Ant Design, or Material-UI
2. **Routing**: React Router for navigation
3. **State Management**: Context API, Redux, or Zustand
4. **API Client**: Axios or Fetch wrapper for Pulsar backend
5. **Testing**: Vitest, React Testing Library, or Playwright
6. **Linting**: ESLint and Prettier configurations
7. **Environment Config**: .env files for different environments

## Related Projects

- **pulsar/**: Backend API server (Node.js/Koa)
- **luna/**: Mobile application (React Native/Expo)
- **planet/**: Project management and configuration service
- **supernova/**: Dashboard application (React/Ant Design)
- **earth/**: Portfolio website (Vue 3/Vite)

## License

Private - Part of Pulsar Interactive

## Author

Rodrigo Medina - [https://rckdrigo.xyz](https://rckdrigo.xyz)
