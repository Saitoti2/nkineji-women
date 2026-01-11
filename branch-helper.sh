#!/bin/bash

# Branch Management Helper Script
# Usage: ./branch-helper.sh [command] [branch-name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${BOLD}$1${NC}"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
}

# Show current status
show_status() {
    log_header "📊 Current Git Status"
    
    current_branch=$(git branch --show-current)
    log_info "Current branch: $current_branch"
    
    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "You have uncommitted changes:"
        git status --short
        echo ""
        log_info "Consider committing or stashing changes before switching branches"
    else
        log_success "Working directory is clean"
    fi
    
    # Show available branches
    log_header "🌿 Available Branches"
    git branch -a
}

# Create new feature branch
create_branch() {
    local branch_name=$1
    local base_branch=${2:-"feature/backend-implementation"}
    
    if [[ -z "$branch_name" ]]; then
        log_error "Branch name is required"
        echo "Usage: $0 create <branch-name> [base-branch]"
        exit 1
    fi
    
    log_header "🌱 Creating New Branch"
    log_info "Branch name: $branch_name"
    log_info "Base branch: $base_branch"
    
    # Check if branch already exists
    if git show-ref --verify --quiet refs/heads/$branch_name; then
        log_error "Branch '$branch_name' already exists"
        exit 1
    fi
    
    # Checkout base branch and pull latest
    log_info "Switching to base branch: $base_branch"
    git checkout $base_branch
    
    if git show-ref --verify --quiet refs/remotes/origin/$base_branch; then
        log_info "Pulling latest changes from origin"
        git pull origin $base_branch
    fi
    
    # Create and checkout new branch
    log_info "Creating new branch: $branch_name"
    git checkout -b $branch_name
    
    log_success "Successfully created and switched to branch: $branch_name"
    
    # Show next steps
    log_header "📋 Next Steps"
    echo "1. Make your changes"
    echo "2. Commit regularly: git add . && git commit -m 'your message'"
    echo "3. Push when ready: git push -u origin $branch_name"
    echo "4. Create pull request when feature is complete"
}

# Switch to existing branch
switch_branch() {
    local branch_name=$1
    
    if [[ -z "$branch_name" ]]; then
        log_error "Branch name is required"
        echo "Usage: $0 switch <branch-name>"
        exit 1
    fi
    
    log_header "🔄 Switching Branch"
    
    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "You have uncommitted changes. Stashing them..."
        git stash push -m "Auto-stash before switching to $branch_name"
        log_info "Changes stashed. Use 'git stash pop' to restore them later."
    fi
    
    # Switch to branch
    if git show-ref --verify --quiet refs/heads/$branch_name; then
        git checkout $branch_name
        log_success "Switched to existing branch: $branch_name"
    elif git show-ref --verify --quiet refs/remotes/origin/$branch_name; then
        git checkout -b $branch_name origin/$branch_name
        log_success "Checked out remote branch: $branch_name"
    else
        log_error "Branch '$branch_name' not found locally or remotely"
        exit 1
    fi
}

# Setup development environment for current branch
setup_dev() {
    log_header "🔧 Setting Up Development Environment"
    
    current_branch=$(git branch --show-current)
    log_info "Current branch: $current_branch"
    
    # Install frontend dependencies
    if [[ -f "package.json" ]]; then
        log_info "Installing frontend dependencies..."
        npm install
        log_success "Frontend dependencies installed"
    fi
    
    # Install backend dependencies if on backend branch
    if [[ "$current_branch" == *"backend"* ]] && [[ -f "backend/package.json" ]]; then
        log_info "Installing backend dependencies..."
        cd backend && npm install && cd ..
        log_success "Backend dependencies installed"
    fi
    
    # Check environment files
    if [[ ! -f ".env" ]]; then
        log_warning "Frontend .env file not found"
        if [[ -f ".env.example" ]]; then
            log_info "Copying .env.example to .env"
            cp .env.example .env
        fi
    fi
    
    if [[ -f "backend/.env.example" ]] && [[ ! -f "backend/.env" ]]; then
        log_warning "Backend .env file not found"
        log_info "Copying backend/.env.example to backend/.env"
        cp backend/.env.example backend/.env
        log_info "Please edit backend/.env with your database credentials"
    fi
    
    log_success "Development environment setup complete"
    
    # Show how to start development
    log_header "🚀 Start Development"
    echo "Frontend only:"
    echo "  npm run dev"
    echo ""
    echo "Full stack (run in separate terminals):"
    echo "  Terminal 1: npm run dev"
    echo "  Terminal 2: cd backend && npm run dev"
}

# Show help
show_help() {
    echo "Branch Management Helper"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  status                    Show current git status and available branches"
    echo "  create <name> [base]      Create new feature branch from base (default: feature/backend-implementation)"
    echo "  switch <name>             Switch to existing branch (stashes changes if needed)"
    echo "  setup                     Setup development environment for current branch"
    echo "  help                      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 create feature/payment-integration"
    echo "  $0 create feature/ui-improvements main"
    echo "  $0 switch main"
    echo "  $0 setup"
}

# Main script logic
main() {
    check_git_repo
    
    case "${1:-help}" in
        "status")
            show_status
            ;;
        "create")
            create_branch "$2" "$3"
            ;;
        "switch")
            switch_branch "$2"
            ;;
        "setup")
            setup_dev
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"