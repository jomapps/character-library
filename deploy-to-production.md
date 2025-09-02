# Production Deployment Guide for Character Library

This guide walks you through deploying the Character Library application to production using the domain `character.ft.tc`.

## Prerequisites

### Production Server Requirements
- **OS**: Ubuntu 20.04+ or similar Linux distribution
- **Node.js**: 18.20.2+ or 20.9.0+
- **Docker & Docker Compose**: Latest stable versions
- **MongoDB**: 5.0+ (can be containerized)
- **Memory**: 4GB+ RAM recommended
- **Storage**: 20GB+ free space
- **Network**: Open ports 80, 443, 3000, 27017

### Domain Setup
- Domain `character.ft.tc` pointing to your production server IP
- SSL certificate (Let's Encrypt recommended)

## Step 1: Server Preparation

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

### 1.3 Install Nginx (for reverse proxy)
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

### 1.4 Install Certbot (for SSL)
```bash
sudo apt install certbot python3-certbot-nginx -y
```

## Step 2: Application Deployment

### 2.1 Clone Repository
```bash
cd /opt
sudo git clone https://github.com/your-username/character-library.git
sudo chown -R $USER:$USER character-library
cd character-library
```

### 2.2 Create Production Environment File
```bash
cp .env.example .env.production
```

Edit `.env.production` with production values:
```env
# Database
DATABASE_URI=mongodb://mongo:27017/character_library_prod

# Payload CMS
PAYLOAD_SECRET=your-super-secure-secret-key-here-min-32-chars

# Application
NODE_ENV=production
PORT=3000

# External Services (if using)
DINOV3_SERVICE_URL=http://dino.ft.tc
PATHRAG_SERVICE_URL=http://pathrag.ft.tc

# Optional: Add other service configurations
```

### 2.3 Create Production Docker Compose
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - mongo
    restart: unless-stopped
    volumes:
      - ./media:/app/media

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped
    command: --storageEngine=wiredTiger

volumes:
  mongo_data:
```

## Step 3: Configure Next.js for Production

### 3.1 Update next.config.mjs
Add `output: 'standalone'` to your Next.js config for Docker compatibility.

### 3.2 Build and Deploy
```bash
# Build the application
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Step 4: Configure Nginx Reverse Proxy

### 4.1 Create Nginx Configuration
Create `/etc/nginx/sites-available/character.ft.tc`:
```nginx
server {
    listen 80;
    server_name character.ft.tc;

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
    }
}
```

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/character.ft.tc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: SSL Certificate Setup

### 5.1 Obtain SSL Certificate
```bash
sudo certbot --nginx -d character.ft.tc
```

### 5.2 Auto-renewal Setup
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Git-based Deployment Workflow

### 6.1 Simple Git Pull Deployment
Create a deployment script `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

### 6.2 Deployment Process
```bash
# On your local machine
git add .
git commit -m "Your changes"
git push origin main

# On production server
cd /opt/character-library
./deploy.sh
```

## Step 7: Monitoring and Maintenance

### 7.1 Check Application Status
```bash
# Check containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check Nginx status
sudo systemctl status nginx
```

### 7.2 Database Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec character-library_mongo_1 mongodump --db character_library_prod --out /data/db/backup_$DATE
```

## Step 8: Security Considerations

### 8.1 Firewall Setup
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 8.2 Environment Security
- Use strong, unique passwords
- Regularly update dependencies
- Monitor logs for suspicious activity
- Keep Docker images updated

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000, 27017 are available
2. **Permission issues**: Check file ownership and Docker permissions
3. **Memory issues**: Monitor RAM usage, consider swap if needed
4. **SSL issues**: Check domain DNS and certificate validity

### Useful Commands
```bash
# Restart application
docker-compose -f docker-compose.prod.yml restart app

# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Access MongoDB shell
docker exec -it character-library_mongo_1 mongosh character_library_prod

# Check disk usage
df -h
```

## Next Steps

After successful deployment:
1. Test all application features
2. Set up monitoring (consider tools like Uptime Robot)
3. Configure automated backups
4. Set up log rotation
5. Consider implementing CI/CD pipeline for automated deployments

Your Character Library should now be accessible at `https://character.ft.tc`!
