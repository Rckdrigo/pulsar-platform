#!/bin/bash

# Environment Configuration Management Script
# Helps setup and manage environment variables across different environments

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Setup development environment
setup_development() {
    info "Setting up development environment..."

    # Setup Pulsar development environment
    if [ -d "$PROJECT_ROOT/pulsar" ]; then
        cd "$PROJECT_ROOT/pulsar"

        if [ ! -f ".env.development" ]; then
            if [ -f ".env.development.template" ]; then
                cp .env.development.template .env.development
                success "Created pulsar/.env.development from template"
                warning "Please edit pulsar/.env.development and configure your settings"
            else
                error "Template file not found: pulsar/.env.development.template"
            fi
        else
            warning "pulsar/.env.development already exists"
        fi
    fi

    # Setup Planet development environment
    if [ -d "$PROJECT_ROOT/planet" ]; then
        cd "$PROJECT_ROOT/planet"

        if [ ! -f ".env.development" ]; then
            if [ -f ".env.development.template" ]; then
                cp .env.development.template .env.development
                success "Created planet/.env.development from template"
            else
                error "Template file not found: planet/.env.development.template"
            fi
        else
            warning "planet/.env.development already exists"
        fi
    fi

    cd "$PROJECT_ROOT"
}

# Display production environment configuration
show_production_config() {
    info "Production Environment Configuration"
    echo

    echo "🛤️  Railway (Pulsar Backend) Environment Variables:"
    echo "Copy these to your Railway dashboard:"
    echo
    if [ -f "$PROJECT_ROOT/pulsar/.env.production.template" ]; then
        grep -v '^#' "$PROJECT_ROOT/pulsar/.env.production.template" | grep -v '^$' | while read line; do
            echo "  $line"
        done
    fi
    echo

    echo "⚡ Vercel (Planet Frontend) Environment Variables:"
    echo "These are already configured in vercel.json, but you can override them:"
    echo
    if [ -f "$PROJECT_ROOT/planet/.env.production.template" ]; then
        grep -v '^#' "$PROJECT_ROOT/planet/.env.production.template" | grep -v '^$' | while read line; do
            echo "  $line"
        done
    fi
    echo
}

# Validate environment configuration
validate_environment() {
    local env_type="$1"
    info "Validating $env_type environment configuration..."

    local valid=true

    # Check Pulsar environment
    if [ -d "$PROJECT_ROOT/pulsar" ]; then
        local pulsar_env="$PROJECT_ROOT/pulsar/.env.$env_type"
        if [ -f "$pulsar_env" ]; then
            success "Pulsar .$env_type environment file found"

            # Check required variables for development
            if [ "$env_type" = "development" ]; then
                if ! grep -q "NODE_ENV=development" "$pulsar_env"; then
                    warning "NODE_ENV should be set to 'development'"
                    valid=false
                fi
                if ! grep -q "PORT=" "$pulsar_env"; then
                    warning "PORT should be configured"
                    valid=false
                fi
            fi
        else
            error "Pulsar .$env_type environment file not found"
            valid=false
        fi
    fi

    # Check Planet environment
    if [ -d "$PROJECT_ROOT/planet" ]; then
        local planet_env="$PROJECT_ROOT/planet/.env.$env_type"
        if [ -f "$planet_env" ]; then
            success "Planet .$env_type environment file found"

            # Check required variables
            if ! grep -q "VITE_API_BASE_URL=" "$planet_env"; then
                warning "VITE_API_BASE_URL should be configured"
                valid=false
            fi
        else
            error "Planet .$env_type environment file not found"
            valid=false
        fi
    fi

    if [ "$valid" = true ]; then
        success "Environment configuration is valid"
    else
        warning "Environment configuration needs attention"
    fi

    return $([[ "$valid" = true ]] && echo 0 || echo 1)
}

# Check for sensitive data in environment files
check_security() {
    info "Checking for security issues..."

    local issues_found=false

    # List of patterns that might indicate sensitive data
    local sensitive_patterns=(
        "password.*="
        "secret.*=.{8,}"
        "key.*=.{8,}"
        "token.*=.{8,}"
    )

    for project in pulsar planet; do
        if [ -d "$PROJECT_ROOT/$project" ]; then
            for env_file in "$PROJECT_ROOT/$project"/.env*; do
                if [ -f "$env_file" ] && [[ ! "$env_file" =~ \.template$ ]]; then
                    for pattern in "${sensitive_patterns[@]}"; do
                        if grep -qi "$pattern" "$env_file" 2>/dev/null; then
                            if [[ "$(basename "$env_file")" != ".env.development" ]]; then
                                warning "Potential sensitive data found in $(basename "$env_file")"
                                issues_found=true
                            fi
                        fi
                    done
                fi
            done
        fi
    done

    if [ "$issues_found" = false ]; then
        success "No obvious security issues found"
    else
        warning "Please review flagged files for sensitive data"
    fi
}

# Clean up environment files
cleanup_env() {
    info "Cleaning up environment files..."

    read -p "This will remove all .env files (not templates). Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Cleanup cancelled"
        return
    fi

    for project in pulsar planet; do
        if [ -d "$PROJECT_ROOT/$project" ]; then
            cd "$PROJECT_ROOT/$project"
            for env_file in .env*; do
                if [ -f "$env_file" ] && [[ ! "$env_file" =~ \.template$ ]]; then
                    rm "$env_file"
                    success "Removed $project/$env_file"
                fi
            done
        fi
    done

    cd "$PROJECT_ROOT"
    success "Environment cleanup completed"
}

# Display help
show_help() {
    echo "Environment Configuration Management Script"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  setup-dev           Setup development environment files"
    echo "  show-prod           Display production configuration"
    echo "  validate-dev        Validate development environment"
    echo "  validate-prod       Validate production environment"
    echo "  check-security      Check for security issues"
    echo "  cleanup             Remove all .env files (not templates)"
    echo "  help                Show this help message"
    echo
    echo "Examples:"
    echo "  $0 setup-dev        # Create .env.development files from templates"
    echo "  $0 validate-dev     # Check development environment configuration"
    echo "  $0 show-prod        # Show production environment variables"
}

# Main execution
main() {
    local command="${1:-help}"

    case "$command" in
        "setup-dev")
            setup_development
            ;;
        "show-prod")
            show_production_config
            ;;
        "validate-dev")
            validate_environment "development"
            ;;
        "validate-prod")
            validate_environment "production"
            ;;
        "check-security")
            check_security
            ;;
        "cleanup")
            cleanup_env
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Unknown command: $command"
            echo
            show_help
            exit 1
            ;;
    esac
}

main "$@"