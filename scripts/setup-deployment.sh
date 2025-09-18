#!/bin/bash

# Setup script for Pulsar Interactive deployment
# This script helps configure the deployment environment

set -e

echo "🚀 Pulsar Interactive Deployment Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    info "Checking dependencies..."

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        success "Node.js found: $NODE_VERSION"
    else
        error "Node.js not found. Please install Node.js 22.x or later."
        exit 1
    fi

    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        success "npm found: $NPM_VERSION"
    else
        error "npm not found."
        exit 1
    fi

    # Check git
    if command -v git &> /dev/null; then
        success "Git found"
    else
        error "Git not found. Please install Git."
        exit 1
    fi

    # Check Railway CLI (optional)
    if command -v railway &> /dev/null; then
        success "Railway CLI found"
    else
        warning "Railway CLI not found. Install with: npm install -g @railway/cli"
    fi

    # Check Vercel CLI (optional)
    if command -v vercel &> /dev/null; then
        success "Vercel CLI found"
    else
        warning "Vercel CLI not found. Install with: npm install -g vercel"
    fi
}

# Install project dependencies
install_dependencies() {
    info "Installing project dependencies..."

    # Install Pulsar dependencies
    if [ -d "pulsar" ]; then
        info "Installing Pulsar dependencies..."
        cd pulsar
        npm ci
        success "Pulsar dependencies installed"
        cd ..
    else
        warning "Pulsar directory not found"
    fi

    # Install Planet dependencies
    if [ -d "planet" ]; then
        info "Installing Planet dependencies..."
        cd planet
        npm ci
        success "Planet dependencies installed"
        cd ..
    else
        warning "Planet directory not found"
    fi
}

# Setup Railway
setup_railway() {
    info "Setting up Railway..."

    if ! command -v railway &> /dev/null; then
        info "Installing Railway CLI..."
        npm install -g @railway/cli
    fi

    read -p "Do you want to login to Railway? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway login
        success "Railway login completed"
    fi

    read -p "Do you want to create a new Railway project? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd pulsar
        railway init
        railway add postgresql
        success "Railway project created with PostgreSQL"
        cd ..
    fi
}

# Check configuration files
check_configuration() {
    info "Checking configuration files..."

    # Check Railway configuration
    if [ -f "pulsar/railway.toml" ]; then
        success "Railway configuration found"
    else
        warning "Railway configuration not found"
    fi

    # Check Vercel configuration
    if [ -f "planet/vercel.json" ]; then
        success "Vercel configuration found"
    else
        warning "Vercel configuration not found"
    fi

    # Check GitHub workflows
    if [ -d ".github/workflows" ]; then
        success "GitHub workflows found"
    else
        warning "GitHub workflows not found"
    fi
}

# Run tests
run_tests() {
    info "Running tests..."

    # Test Pulsar
    if [ -d "pulsar" ]; then
        cd pulsar
        if npm run lint:check && npm run format:check; then
            success "Pulsar linting and formatting passed"
        else
            error "Pulsar linting or formatting failed"
        fi

        if npm run build; then
            success "Pulsar build successful"
        else
            error "Pulsar build failed"
        fi

        # Run Railway check if available
        if npm run railway:check; then
            success "Railway configuration check passed"
        else
            warning "Railway configuration check failed or unavailable"
        fi

        cd ..
    fi

    # Test Planet
    if [ -d "planet" ]; then
        cd planet
        if npm run lint && npm run format:check; then
            success "Planet linting and formatting passed"
        else
            error "Planet linting or formatting failed"
        fi

        if npm run build; then
            success "Planet build successful"
        else
            error "Planet build failed"
        fi

        if npm run security-check; then
            success "Planet security check passed"
        else
            warning "Planet security check failed"
        fi

        cd ..
    fi
}

# Display next steps
show_next_steps() {
    echo
    info "🎉 Setup completed successfully!"
    echo
    echo "📋 Next Steps:"
    echo "1. Set up GitHub Secrets in your repository:"
    echo "   - RAILWAY_TOKEN"
    echo "   - RAILWAY_PROJECT_ID"
    echo "   - VERCEL_TOKEN"
    echo "   - VERCEL_ORG_ID"
    echo "   - VERCEL_PROJECT_ID"
    echo
    echo "2. Set Railway environment variables:"
    echo "   - NODE_ENV=production"
    echo "   - PORT=3000"
    echo "   - HAS_DB=true"
    echo
    echo "3. Connect Vercel to your GitHub repository"
    echo
    echo "4. Push to main branch to trigger deployment:"
    echo "   git push origin main"
    echo
    echo "📚 Documentation:"
    echo "   - See DEPLOYMENT.md for detailed instructions"
    echo "   - Check .github/workflows/ for CI/CD configuration"
    echo
    echo "🔍 Health checks:"
    echo "   - Backend: https://pulsar-api.railway.app/api/v1/health"
    echo "   - Frontend: https://manage.pulsarinteractive.xyz"
}

# Main execution
main() {
    check_dependencies
    echo

    read -p "Do you want to install project dependencies? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_dependencies
        echo
    fi

    read -p "Do you want to setup Railway? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_railway
        echo
    fi

    check_configuration
    echo

    read -p "Do you want to run tests? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
        echo
    fi

    show_next_steps
}

# Run main function
main "$@"