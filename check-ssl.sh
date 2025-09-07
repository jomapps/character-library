#!/bin/bash

# SSL Certificate Verification Script for Character Library
# This script checks the SSL certificate status for character.ft.tc

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
    echo -e "${BLUE}[CHECK]${NC} $1"
}

# Domain configuration
DOMAIN="character.ft.tc"

print_header "🔍 Checking SSL status for $DOMAIN"

# Check if domain resolves
print_status "Checking DNS resolution..."
if nslookup $DOMAIN > /dev/null 2>&1; then
    IP=$(nslookup $DOMAIN | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    print_status "✅ Domain resolves to: $IP"
else
    print_error "❌ Domain does not resolve"
    exit 1
fi

# Check if ports are open
print_status "Checking port accessibility..."
if timeout 5 bash -c "</dev/tcp/$DOMAIN/80" 2>/dev/null; then
    print_status "✅ Port 80 is accessible"
else
    print_warning "⚠️  Port 80 is not accessible"
fi

if timeout 5 bash -c "</dev/tcp/$DOMAIN/443" 2>/dev/null; then
    print_status "✅ Port 443 is accessible"
else
    print_error "❌ Port 443 is not accessible"
fi

# Check HTTP to HTTPS redirect
print_status "Checking HTTP to HTTPS redirect..."
HTTP_RESPONSE=$(curl -s -I -L http://$DOMAIN | head -1)
if echo "$HTTP_RESPONSE" | grep -q "200\|301\|302"; then
    print_status "✅ HTTP redirect is working"
else
    print_warning "⚠️  HTTP redirect may not be working properly"
fi

# Check SSL certificate
print_status "Checking SSL certificate..."
if command -v openssl > /dev/null; then
    SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        print_status "✅ SSL certificate is valid"
        echo "$SSL_INFO" | while read line; do
            echo "    $line"
        done
        
        # Check expiration
        EXPIRY=$(echo "$SSL_INFO" | grep "notAfter" | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$EXPIRY" +%s 2>/dev/null)
        CURRENT_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
        
        if [ $DAYS_LEFT -gt 30 ]; then
            print_status "✅ Certificate expires in $DAYS_LEFT days"
        elif [ $DAYS_LEFT -gt 7 ]; then
            print_warning "⚠️  Certificate expires in $DAYS_LEFT days - renewal recommended"
        else
            print_error "❌ Certificate expires in $DAYS_LEFT days - urgent renewal needed"
        fi
    else
        print_error "❌ SSL certificate check failed"
    fi
else
    print_warning "⚠️  OpenSSL not available for certificate check"
fi

# Check HTTPS response
print_status "Checking HTTPS response..."
HTTPS_RESPONSE=$(curl -s -I https://$DOMAIN | head -1)
if echo "$HTTPS_RESPONSE" | grep -q "200"; then
    print_status "✅ HTTPS site is responding correctly"
else
    print_error "❌ HTTPS site is not responding correctly"
    echo "Response: $HTTPS_RESPONSE"
fi

# Check security headers
print_status "Checking security headers..."
HEADERS=$(curl -s -I https://$DOMAIN)

check_header() {
    local header=$1
    local description=$2
    if echo "$HEADERS" | grep -qi "$header"; then
        print_status "✅ $description header is present"
    else
        print_warning "⚠️  $description header is missing"
    fi
}

check_header "Strict-Transport-Security" "HSTS"
check_header "X-Frame-Options" "X-Frame-Options"
check_header "X-Content-Type-Options" "X-Content-Type-Options"
check_header "X-XSS-Protection" "X-XSS-Protection"

# Check if certbot is installed and certificates exist
if command -v certbot > /dev/null; then
    print_status "Checking Let's Encrypt certificates..."
    if sudo certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
        print_status "✅ Let's Encrypt certificate found"
        sudo certbot certificates | grep -A10 "$DOMAIN"
    else
        print_warning "⚠️  No Let's Encrypt certificate found for $DOMAIN"
    fi
else
    print_warning "⚠️  Certbot not installed"
fi

# Check nginx configuration
if command -v nginx > /dev/null; then
    print_status "Checking Nginx configuration..."
    if nginx -t 2>/dev/null; then
        print_status "✅ Nginx configuration is valid"
    else
        print_error "❌ Nginx configuration has errors"
    fi
    
    if [ -f "/etc/nginx/sites-enabled/$DOMAIN" ]; then
        print_status "✅ Nginx site configuration exists"
    else
        print_warning "⚠️  Nginx site configuration not found"
    fi
else
    print_warning "⚠️  Nginx not installed"
fi

# Check auto-renewal setup
print_status "Checking certificate auto-renewal..."
if crontab -l 2>/dev/null | grep -q "certbot renew"; then
    print_status "✅ Auto-renewal cron job is configured"
else
    print_warning "⚠️  Auto-renewal cron job not found"
fi

# SSL Labs test (optional)
print_status "For detailed SSL analysis, visit:"
print_status "https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"

print_header "🔍 SSL Check Complete!"
