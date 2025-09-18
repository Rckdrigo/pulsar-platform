#!/bin/bash

# Dev Server Initialization Script for Claude Code
# Automatically checks and starts development servers for Pulsar Interactive

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PULSAR_PORT=3000
PLANET_PORT=5173

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    lsof -ti:$port > /dev/null 2>&1
}

# Function to start a server in background
start_server() {
    local project_name=$1
    local port=$2
    local directory=$3
    local npm_script=$4

    echo -e "${BLUE}🚀 Starting $project_name server on port $port...${NC}"

    cd "$PROJECT_ROOT/$directory" || {
        echo -e "${RED}❌ Error: Could not navigate to $directory${NC}"
        return 1
    }

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: package.json not found in $directory${NC}"
        return 1
    fi

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Dependencies not installed. Running npm install...${NC}"
        npm install
    fi

    # Start the server in background
    nohup npm run $npm_script > "/tmp/${project_name}-server.log" 2>&1 &
    local server_pid=$!

    # Wait a moment for server to start
    sleep 2

    # Check if server started successfully
    if check_port $port; then
        echo -e "${GREEN}✅ $project_name server started successfully at http://localhost:$port${NC}"
        echo "   PID: $server_pid"
        echo "   Logs: /tmp/${project_name}-server.log"
        return 0
    else
        echo -e "${RED}❌ Failed to start $project_name server${NC}"
        echo "   Check logs: /tmp/${project_name}-server.log"
        return 1
    fi
}

# Function to display server status
show_status() {
    echo -e "${BLUE}📊 Development Server Status:${NC}"
    echo "================================="

    if check_port $PULSAR_PORT; then
        echo -e "   Pulsar Backend:  ${GREEN}✅ Running${NC} (http://localhost:$PULSAR_PORT)"
    else
        echo -e "   Pulsar Backend:  ${RED}❌ Stopped${NC}"
    fi

    if check_port $PLANET_PORT; then
        echo -e "   Planet Frontend: ${GREEN}✅ Running${NC} (http://localhost:$PLANET_PORT)"
    else
        echo -e "   Planet Frontend: ${RED}❌ Stopped${NC}"
    fi

    echo ""
}

# Main logic
main() {
    local start_backend=false
    local start_frontend=false
    local show_status_only=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend|-b)
                start_backend=true
                shift
                ;;
            --frontend|-f)
                start_frontend=true
                shift
                ;;
            --both|-a)
                start_backend=true
                start_frontend=true
                shift
                ;;
            --status|-s)
                show_status_only=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  -b, --backend     Start Pulsar backend server"
                echo "  -f, --frontend    Start Planet frontend server"
                echo "  -a, --both        Start both servers"
                echo "  -s, --status      Show server status only"
                echo "  -h, --help        Show this help message"
                echo ""
                echo "Default behavior (no args): Start backend if not running"
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Show current status
    show_status

    if $show_status_only; then
        exit 0
    fi

    # Default behavior: start backend if no specific options given
    if [ "$start_backend" = false ] && [ "$start_frontend" = false ]; then
        if ! check_port $PULSAR_PORT; then
            start_backend=true
        fi
    fi

    # Start servers as requested
    if $start_backend && ! check_port $PULSAR_PORT; then
        start_server "Pulsar" $PULSAR_PORT "pulsar" "dev"
    elif $start_backend; then
        echo -e "${YELLOW}⚠️  Pulsar backend already running on port $PULSAR_PORT${NC}"
    fi

    if $start_frontend && ! check_port $PLANET_PORT; then
        start_server "Planet" $PLANET_PORT "planet" "dev"
    elif $start_frontend; then
        echo -e "${YELLOW}⚠️  Planet frontend already running on port $PLANET_PORT${NC}"
    fi

    echo -e "${GREEN}🎉 Development environment ready!${NC}"
}

# Run main function with all arguments
main "$@"