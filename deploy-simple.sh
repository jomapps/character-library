#!/bin/bash
set -e

echo "🚀 Starting simple deployment for Character Library..."

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

# Run service tests first
print_status "Running pre-deployment service tests..."
if [ -f "test-services.sh" ]; then
    chmod +x test-services.sh
    if ./test-services.sh; then
        print_status "✅ All services are available"
    else
        print_error "❌ Service tests failed. Please fix issues before deploying."
        exit 1
    fi
else
    print_warning "test-services.sh not found, skipping service tests"
fi

# Check if .env file exists
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    print_error "No environment file found. Please create .env or .env.production"
    exit 1
fi

# Pull latest changes
print_status "Pulling latest changes from Git..."
git pull origin master

# Install dependencies
print_status "Installing dependencies..."
pnpm install

# Build the application
print_status "Building application..."
pnpm build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Please install it first: npm install -g pm2"
    exit 1
fi

# Create ecosystem config if it doesn't exist
if [ ! -f "ecosystem.config.js" ]; then
    print_status "Creating PM2 ecosystem configuration..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'character-library',
    script: 'pnpm',
    args: 'start',
    cwd: process.cwd(),
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF
fi

# Create logs directory
mkdir -p logs

# Restart or start the application with PM2
print_status "Restarting application with PM2..."
if pm2 list | grep -q "character-library"; then
    pm2 restart character-library
    print_status "Application restarted"
else
    pm2 start ecosystem.config.js
    pm2 save
    print_status "Application started for the first time"
fi

# Wait for application to start
print_status "Waiting for application to start..."
sleep 5

# Check if application is running
if pm2 list | grep -q "character-library.*online"; then
    print_status "✅ Deployment successful!"
    print_status "Application is running on port 3000"
    
    # Test local connection
    if curl -s http://localhost:3000 > /dev/null; then
        print_status "✅ Application is responding to HTTP requests"
    else
        print_warning "⚠️  Application may still be starting up"
    fi
    
    print_status "Check logs with: pm2 logs character-library"
    print_status "Monitor with: pm2 monit"
else
    print_error "❌ Deployment failed. Check logs with: pm2 logs character-library"
    exit 1
fi

# Show PM2 status
print_status "Current PM2 status:"
pm2 list
