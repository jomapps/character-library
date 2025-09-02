#!/bin/bash
set -e

echo "🚀 Starting deployment for Character Library..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating from .env.example..."
    cp .env.example .env.production
    print_warning "Please edit .env.production with your production values before continuing."
    exit 1
fi

# Pull latest changes
print_status "Pulling latest changes from Git..."
git pull origin main

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Build new images
print_status "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    print_status "Application should be available at http://localhost:3000"
    print_status "Check logs with: docker-compose -f docker-compose.prod.yml logs -f"
else
    print_error "❌ Deployment failed. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Show running containers
print_status "Running containers:"
docker-compose -f docker-compose.prod.yml ps
