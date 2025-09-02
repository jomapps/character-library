#!/bin/bash

# Character Library - Service Availability Test Script
# This script checks if all required services are available before deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored output
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check HTTP service
check_http_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" | grep -q "$expected_status"; then
        print_success "$name is accessible at $url"
        return 0
    else
        print_error "$name is not accessible at $url"
        return 1
    fi
}

# Function to check MongoDB connection
check_mongodb() {
    local uri=$1
    
    if command_exists mongosh; then
        if mongosh "$uri" --eval "db.runCommand('ping')" >/dev/null 2>&1; then
            print_success "MongoDB is accessible at $uri"
            return 0
        else
            print_error "MongoDB is not accessible at $uri"
            return 1
        fi
    elif command_exists mongo; then
        if mongo "$uri" --eval "db.runCommand('ping')" >/dev/null 2>&1; then
            print_success "MongoDB is accessible at $uri"
            return 0
        else
            print_error "MongoDB is not accessible at $uri"
            return 1
        fi
    else
        print_warning "MongoDB client (mongosh/mongo) not found, cannot test connection"
        return 1
    fi
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              Character Library Service Test                  ║"
echo "║                                                              ║"
echo "║  This script verifies all required services are available   ║"
echo "║  before deploying the Character Library application.         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Load environment variables if .env exists
if [ -f ".env" ]; then
    print_info "Loading environment variables from .env file"
    export $(grep -v '^#' .env | xargs)
elif [ -f ".env.production" ]; then
    print_info "Loading environment variables from .env.production file"
    export $(grep -v '^#' .env.production | xargs)
else
    print_warning "No .env file found, using default values"
fi

# Check System Requirements
print_header "System Requirements"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_success "Node.js version is compatible (>= 18)"
    else
        print_error "Node.js version is too old. Required: >= 18, Found: $NODE_VERSION"
    fi
else
    print_error "Node.js is not installed"
fi

# Check pnpm
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm is installed: $PNPM_VERSION"
else
    print_warning "pnpm is not installed (will need to install before deployment)"
fi

# Check PM2
if command_exists pm2; then
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 is installed: $PM2_VERSION"
else
    print_warning "PM2 is not installed (will need to install before deployment)"
fi

# Check Nginx
if command_exists nginx; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d' ' -f3)
    print_success "Nginx is installed: $NGINX_VERSION"
    
    # Check if Nginx is running
    if systemctl is-active --quiet nginx; then
        print_success "Nginx service is running"
    else
        print_warning "Nginx service is not running"
    fi
else
    print_warning "Nginx is not installed (will need to install before deployment)"
fi

# Check Database Connection
print_header "Database Services"

DATABASE_URI=${DATABASE_URI:-"mongodb://localhost:27017/character-library"}
print_info "Testing MongoDB connection: $DATABASE_URI"
check_mongodb "$DATABASE_URI"

# Check External Services
print_header "External Services"

# Check DINO Service
if [ -n "$DINO_SERVICE_URL" ]; then
    print_info "Testing DINO service: $DINO_SERVICE_URL"
    check_http_service "DINO Service" "$DINO_SERVICE_URL/health" "200"
else
    print_warning "DINO_SERVICE_URL not configured"
fi

# Check PathRAG Service
if [ -n "$PATHRAG_SERVICE_URL" ]; then
    print_info "Testing PathRAG service: $PATHRAG_SERVICE_URL"
    check_http_service "PathRAG Service" "$PATHRAG_SERVICE_URL/health" "200"
else
    print_warning "PATHRAG_SERVICE_URL not configured"
fi

# Check Cloudflare R2 (basic connectivity)
if [ -n "$CLOUDFLARE_R2_ENDPOINT" ]; then
    print_info "Testing Cloudflare R2 connectivity: $CLOUDFLARE_R2_ENDPOINT"
    if curl -s --connect-timeout 10 "$CLOUDFLARE_R2_ENDPOINT" >/dev/null 2>&1; then
        print_success "Cloudflare R2 endpoint is reachable"
    else
        print_warning "Cloudflare R2 endpoint connectivity issue (may be normal for R2)"
    fi
else
    print_warning "CLOUDFLARE_R2_ENDPOINT not configured"
fi

# Check OpenRouter API
if [ -n "$OPENROUTER_BASE_URL" ]; then
    print_info "Testing OpenRouter API: $OPENROUTER_BASE_URL"
    check_http_service "OpenRouter API" "$OPENROUTER_BASE_URL/models" "200"
else
    print_warning "OPENROUTER_BASE_URL not configured"
fi

# Check Network Connectivity
print_header "Network Connectivity"

# Check if ports are available
check_port() {
    local port=$1
    local service=$2
    
    if netstat -tuln | grep -q ":$port "; then
        print_warning "Port $port is already in use (may conflict with $service)"
    else
        print_success "Port $port is available for $service"
    fi
}

check_port 3000 "Character Library"
check_port 80 "HTTP"
check_port 443 "HTTPS"

# Summary
print_header "Test Summary"

echo -e "Results:"
echo -e "  ${GREEN}✅ Passed: $PASSED${NC}"
echo -e "  ${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "  ${RED}❌ Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All critical services are available! Ready for deployment.${NC}"
    exit 0
else
    echo -e "\n${RED}💥 Some critical services are not available. Please fix the issues before deployment.${NC}"
    exit 1
fi
