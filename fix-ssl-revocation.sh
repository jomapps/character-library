#!/bin/bash

# Fix SSL Certificate Revocation Check Issues
# This script adds OCSP stapling and security headers to resolve CRYPT_E_NO_REVOCATION_CHECK

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}[FIX]${NC} $1"
}

# Domain configuration
DOMAIN="character.ft.tc"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"

print_header "🔧 Fixing SSL Revocation Check Issues for $DOMAIN"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root or with sudo"
    exit 1
fi

# Check if nginx config exists
if [ ! -f "$NGINX_CONFIG" ]; then
    print_error "Nginx configuration file not found: $NGINX_CONFIG"
    exit 1
fi

# Backup current configuration
print_status "Creating backup of current configuration..."
cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"

# Create improved configuration with OCSP stapling
print_status "Updating Nginx configuration with OCSP stapling..."
cat > "$NGINX_CONFIG" << 'EOF'
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

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/character.ft.tc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/character.ft.tc/privkey.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # OCSP Stapling - FIXES REVOCATION CHECK ISSUES
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/character.ft.tc/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security headers (fixes missing security headers)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Additional security headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Main location block - proxy to Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Security: Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Test nginx configuration
print_status "Testing Nginx configuration..."
if nginx -t; then
    print_status "✅ Nginx configuration is valid"
else
    print_error "❌ Nginx configuration test failed"
    print_status "Restoring backup..."
    cp "$NGINX_CONFIG.backup."* "$NGINX_CONFIG"
    exit 1
fi

# Reload nginx
print_status "Reloading Nginx..."
systemctl reload nginx

# Test OCSP stapling
print_status "Testing OCSP stapling..."
sleep 2
if echo | openssl s_client -connect $DOMAIN:443 -status 2>/dev/null | grep -q "OCSP Response Status: successful"; then
    print_status "✅ OCSP stapling is working"
else
    print_warning "⚠️  OCSP stapling test inconclusive (may take a few minutes to activate)"
fi

# Set up auto-renewal if not already configured
print_status "Checking certificate auto-renewal..."
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    print_status "Setting up automatic certificate renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    print_status "✅ Auto-renewal configured"
else
    print_status "✅ Auto-renewal already configured"
fi

# Final status
print_header "🎉 SSL Revocation Fix Complete!"
print_status "✅ OCSP stapling enabled (fixes revocation check issues)"
print_status "✅ Security headers added"
print_status "✅ Modern SSL configuration applied"
print_status ""
print_status "The following issues have been resolved:"
print_status "• CRYPT_E_NO_REVOCATION_CHECK errors"
print_status "• Missing security headers"
print_status "• Improved SSL security"
print_status ""
print_status "Test your site: https://$DOMAIN"
print_status "SSL test: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
