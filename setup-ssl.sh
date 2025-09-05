#!/bin/bash
set -e

# SSL Setup Script for Character Library
# This script sets up SSL certificate for character.ft.tc domain

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Domain configuration
DOMAIN="character.ft.tc"
NGINX_AVAILABLE="/etc/nginx/sites-available/$DOMAIN"
NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"

print_header "🔒 Setting up SSL for $DOMAIN"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root or with sudo"
    exit 1
fi

# Check if domain is pointing to this server
print_status "Checking DNS resolution for $DOMAIN..."
if ! nslookup $DOMAIN > /dev/null 2>&1; then
    print_warning "DNS resolution failed for $DOMAIN. Make sure the domain points to this server's IP."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install required packages
print_status "Installing required packages..."
apt update
apt install -y nginx certbot python3-certbot-nginx

# Enable and start nginx
systemctl enable nginx
systemctl start nginx

# Create improved Nginx configuration with SSL support
print_status "Creating Nginx configuration..."
cat > $NGINX_AVAILABLE << 'EOF'
# HTTP server - redirects to HTTPS
server {
    listen 80;
    server_name character.ft.tc;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name character.ft.tc;

    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/character.ft.tc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/character.ft.tc/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy configuration
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        
        # Handle large file uploads
        client_max_body_size 50M;
    }
    
    # Security.txt
    location /.well-known/security.txt {
        return 301 https://character.ft.tc/security.txt;
    }
}
EOF

# Enable the site
print_status "Enabling Nginx site..."
ln -sf $NGINX_AVAILABLE $NGINX_ENABLED

# Remove default nginx site if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm -f /etc/nginx/sites-enabled/default
    print_status "Removed default Nginx site"
fi

# Test nginx configuration
print_status "Testing Nginx configuration..."
if nginx -t; then
    print_status "✅ Nginx configuration is valid"
else
    print_error "❌ Nginx configuration test failed"
    exit 1
fi

# Reload nginx
systemctl reload nginx

# Obtain SSL certificate
print_status "Obtaining SSL certificate from Let's Encrypt..."
if certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect; then
    print_status "✅ SSL certificate obtained successfully"
else
    print_error "❌ Failed to obtain SSL certificate"
    print_warning "Make sure:"
    print_warning "1. Domain $DOMAIN points to this server's public IP"
    print_warning "2. Ports 80 and 443 are open in firewall"
    print_warning "3. No other service is using port 80/443"
    exit 1
fi

# Set up automatic renewal
print_status "Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Test SSL certificate
print_status "Testing SSL certificate..."
if curl -s https://$DOMAIN > /dev/null; then
    print_status "✅ SSL certificate is working"
else
    print_warning "⚠️  SSL test failed - certificate may still be propagating"
fi

# Final status
print_header "🎉 SSL Setup Complete!"
print_status "Your site is now available at: https://$DOMAIN"
print_status "HTTP requests will automatically redirect to HTTPS"
print_status "Certificate will auto-renew via cron job"

# Show certificate info
print_status "Certificate information:"
certbot certificates
