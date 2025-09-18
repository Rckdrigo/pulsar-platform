# Development Scripts

This directory contains utility scripts for the Pulsar Interactive project.

## dev-server-init.sh

Automatically manages development servers for the Pulsar Interactive multi-project repository.

### Usage

```bash
# Check server status only
./scripts/dev-server-init.sh --status

# Start backend server (Pulsar) if not running
./scripts/dev-server-init.sh --backend

# Start frontend server (Planet) if not running
./scripts/dev-server-init.sh --frontend

# Start both servers if not running
./scripts/dev-server-init.sh --both

# Show help
./scripts/dev-server-init.sh --help
```

### Default Behavior

When run without arguments, the script will:
1. Show current server status
2. Start the Pulsar backend server if it's not already running

### Claude Code Integration

This script is automatically executed when starting new Claude Code sessions through the SessionStart hook configured in `.claude/settings.local.json`. This ensures your development environment is ready for work.

### Server Information

- **Pulsar Backend**: Runs on port 3000 (http://localhost:3000)
- **Planet Frontend**: Runs on port 5173 (http://localhost:5173)

### Log Files

Server logs are written to:
- Pulsar: `/tmp/Pulsar-server.log`
- Planet: `/tmp/Planet-server.log`

### Requirements

- Node.js and npm installed
- Project dependencies installed (`npm install` in each project directory)
- Ports 3000 and 5173 available