# Simple Production Deployment Guide for Character Library

This guide walks you through deploying the Character Library application to production using the domain `character.ft.tc` with direct server deployment (no Docker required).

## Prerequisites

### Production Server Requirements
- **Node.js**: 18.20.2+ or 20.9.0+ (already installed)
- **MongoDB**: 5.0+ (already installed and running)
- **pnpm**: Latest version
- **PM2**: Process manager for Node.js applications
- **Nginx**: Reverse proxy and SSL termination
- **Network**: Open ports 80, 443, 3000

### Domain Setup
- Domain `character.ft.tc` pointing to your production server IP
- SSL certificate (Let's Encrypt recommended)

## Step 1: Pre-Deployment Check

Run the test script to verify all services are available:
```bash
chmod +x test-services.sh
./test-services.sh
```

## Step 2: Server Preparation

### 2.1 Install Required Tools
```bash
# Install pnpm if not already installed
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Install PM2 globally
npm install -g pm2

# Install Nginx
sudo apt install nginx -y
sudo systemctl enable nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

## Step 3: Application Deployment

### 3.1 Clone Repository
```bash
cd /opt
sudo git clone https://github.com/your-username/character-library.git
sudo chown -R $USER:$USER character-library
cd character-library
```

### 3.2 Setup Environment
```bash
# Copy your existing .env file to the server
# Update DATABASE_URI if needed for production MongoDB connection
cp .env .env.production

# Update database URI in .env.production if needed:
# DATABASE_URI=mongodb://localhost:27017/character-library
```

### 3.3 Install Dependencies and Build
```bash
# Install dependencies
pnpm install

# Build the application
pnpm build
```

### 3.4 Start Application with PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'character-library',
    script: 'pnpm',
    args: 'start',
    cwd: '/opt/character-library',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
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

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 4: Configure Nginx Reverse Proxy

### 4.1 Create Nginx Configuration
```bash
sudo tee /etc/nginx/sites-available/character.ft.tc << 'EOF'
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
        
        # Handle large file uploads
        client_max_body_size 50M;
    }
}
EOF
```

### 4.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/character.ft.tc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: SSL Certificate Setup

### 5.1 Automated SSL Setup (Recommended)
Use the provided SSL setup script for automated configuration:
```bash
# Make the script executable
chmod +x setup-ssl.sh

# Run the SSL setup script (requires sudo)
sudo ./setup-ssl.sh
```

This script will:
- Install required packages (nginx, certbot)
- Create secure Nginx configuration with HTTPS redirect
- Obtain Let's Encrypt SSL certificate
- Configure security headers
- Set up automatic certificate renewal

### 5.2 Manual SSL Setup (Alternative)
If you prefer manual setup:

#### 5.2.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 5.2.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d character.ft.tc
```

#### 5.2.3 Auto-renewal Setup
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 5.3 Verify SSL Configuration
Check your SSL setup using the verification script:
```bash
# Make the script executable
chmod +x check-ssl.sh

# Run SSL verification
./check-ssl.sh
```

### 5.4 SSL Security Features
The SSL configuration includes:
- **HTTP to HTTPS redirect**: All HTTP traffic automatically redirects to HTTPS
- **Modern TLS protocols**: Only TLS 1.2 and 1.3 are supported
- **Security headers**: HSTS, X-Frame-Options, X-Content-Type-Options, etc.
- **Strong cipher suites**: Modern encryption algorithms
- **Automatic renewal**: Certificate renews automatically before expiration

## Step 6: Simple Git-based Deployment

### 6.1 Create Deployment Script
The `deploy-simple.sh` script handles:
- Pulling latest changes from master branch
- Installing dependencies
- Building the application
- Restarting PM2 process

### 6.2 Deployment Process
```bash
# On your local machine
git add .
git commit -m "Your changes"
git push origin master

# On production server
cd /opt/character-library
./deploy-simple.sh
```

## Step 7: Monitoring and Maintenance

### 7.1 Check Application Status
```bash
# Check PM2 status
pm2 status
pm2 logs character-library

# Check Nginx status
sudo systemctl status nginx

# Check application health
curl http://localhost:3000/api/health
```

### 7.2 Useful Commands
```bash
# Restart application
pm2 restart character-library

# View logs
pm2 logs character-library --lines 100

# Monitor resources
pm2 monit

# Reload Nginx
sudo systemctl reload nginx
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure port 3000 is available
2. **Permission issues**: Check file ownership and permissions
3. **MongoDB connection**: Verify MongoDB is running and accessible
4. **Environment variables**: Check .env.production file

### Service Verification
Run the test script anytime to verify all services:
```bash
./test-services.sh
```

Your Character Library should now be accessible at `https://character.ft.tc`!
