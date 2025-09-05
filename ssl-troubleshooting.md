# SSL Troubleshooting Guide for Character Library

This guide helps you troubleshoot common SSL issues with your `character.ft.tc` domain.

## Quick SSL Status Check

Run the SSL verification script to get an overview:
```bash
./check-ssl.sh
```

## Common SSL Issues and Solutions

### 1. Domain Not Resolving

**Problem**: Domain `character.ft.tc` doesn't point to your server.

**Check**:
```bash
nslookup character.ft.tc
dig character.ft.tc
```

**Solution**:
- Verify DNS A record points to your server's public IP
- Wait for DNS propagation (can take up to 48 hours)
- Check with your domain provider

### 2. Ports Not Accessible

**Problem**: Ports 80 or 443 are blocked.

**Check**:
```bash
# Test from external source
curl -I http://character.ft.tc
curl -I https://character.ft.tc

# Check if ports are listening locally
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

**Solution**:
```bash
# Open firewall ports (Ubuntu/Debian)
sudo ufw allow 80
sudo ufw allow 443

# For CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### 3. Certificate Acquisition Failed

**Problem**: Let's Encrypt certificate request fails.

**Common Causes**:
- Domain doesn't resolve to server
- Ports 80/443 blocked
- Another service using port 80
- Rate limiting from Let's Encrypt

**Check**:
```bash
# Test Let's Encrypt connectivity
curl -I http://character.ft.tc/.well-known/acme-challenge/test

# Check what's using port 80
sudo lsof -i :80
```

**Solution**:
```bash
# Stop conflicting services
sudo systemctl stop apache2  # if Apache is running
sudo systemctl stop nginx    # temporarily

# Try manual certificate request
sudo certbot certonly --standalone -d character.ft.tc

# Restart nginx
sudo systemctl start nginx
```

### 4. Certificate Expired

**Problem**: SSL certificate has expired.

**Check**:
```bash
# Check certificate expiration
echo | openssl s_client -servername character.ft.tc -connect character.ft.tc:443 2>/dev/null | openssl x509 -noout -dates
```

**Solution**:
```bash
# Renew certificate manually
sudo certbot renew

# Force renewal if not due yet
sudo certbot renew --force-renewal

# Restart nginx
sudo systemctl reload nginx
```

### 5. Mixed Content Issues

**Problem**: Site loads over HTTPS but some resources load over HTTP.

**Check**: Browser developer tools console for mixed content warnings.

**Solution**:
- Ensure all internal links use HTTPS or relative URLs
- Update `NEXT_PUBLIC_SERVER_URL` in `.env.production`
- Check for hardcoded HTTP URLs in your application

### 6. Nginx Configuration Issues

**Problem**: Nginx SSL configuration is incorrect.

**Check**:
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

**Solution**:
```bash
# Recreate SSL configuration
sudo ./setup-ssl.sh

# Or manually fix configuration
sudo nano /etc/nginx/sites-available/character.ft.tc
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Auto-Renewal Not Working

**Problem**: Certificate doesn't renew automatically.

**Check**:
```bash
# Check cron jobs
crontab -l
sudo crontab -l

# Test renewal
sudo certbot renew --dry-run
```

**Solution**:
```bash
# Add renewal cron job
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Or use systemd timer (modern approach)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## SSL Best Practices

### Security Headers
Ensure these headers are present (check with `./check-ssl.sh`):
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`

### Certificate Monitoring
Set up monitoring for certificate expiration:
```bash
# Add to cron for weekly certificate check
0 0 * * 0 /path/to/check-ssl.sh | mail -s "SSL Status for character.ft.tc" admin@yourdomain.com
```

### Backup Certificates
```bash
# Backup Let's Encrypt certificates
sudo cp -r /etc/letsencrypt /backup/letsencrypt-$(date +%Y%m%d)
```

## Testing SSL Configuration

### Online Tools
- [SSL Labs Test](https://www.ssllabs.com/ssltest/analyze.html?d=character.ft.tc)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html#hostname=character.ft.tc)

### Command Line Tests
```bash
# Test SSL connection
openssl s_client -connect character.ft.tc:443 -servername character.ft.tc

# Check certificate chain
curl -I https://character.ft.tc

# Test HTTP to HTTPS redirect
curl -I http://character.ft.tc
```

## Emergency SSL Recovery

If SSL is completely broken:

1. **Disable SSL temporarily**:
```bash
# Create temporary HTTP-only config
sudo cp /etc/nginx/sites-available/character.ft.tc /etc/nginx/sites-available/character.ft.tc.backup
sudo nano /etc/nginx/sites-available/character.ft.tc
# Remove SSL configuration, keep only HTTP server block
sudo nginx -t && sudo systemctl reload nginx
```

2. **Fix the issue** using this guide

3. **Re-enable SSL**:
```bash
sudo ./setup-ssl.sh
```

## Getting Help

If you're still having issues:

1. Run `./check-ssl.sh` and save the output
2. Check nginx error logs: `sudo tail -100 /var/log/nginx/error.log`
3. Check certbot logs: `sudo tail -100 /var/log/letsencrypt/letsencrypt.log`
4. Test with online SSL checkers
5. Contact your hosting provider if firewall/network issues persist
