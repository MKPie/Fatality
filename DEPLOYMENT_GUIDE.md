# VendorFlow Raspberry Pi Deployment Guide

## 🎯 Current Status
✅ Backend installed at `/opt/vendorflow/backend/`
✅ Backend running on `http://192.168.0.57:8000`
✅ Frontend built and ready to deploy
✅ All 6 view components + LogViewer created

---

## 📋 Prerequisites Checklist

### System Requirements
- ✅ Raspberry Pi 4 (2GB+ RAM recommended)
- ✅ Raspbian/Raspberry Pi OS
- ✅ Python 3.11+ installed
- ✅ Node.js 18+ installed
- ✅ nginx installed
- ✅ Network access

### Verify Backend
```bash
# Check backend is running
curl http://192.168.0.57:8000/health

# Check backend logs
sudo journalctl -u vendorflow-backend -n 50 --no-pager
```

---

## 🚀 Frontend Deployment Steps

### Step 1: Copy Built Files to Server
```bash
# On your local machine, copy the dist folder to Raspberry Pi
scp -r dist/ mkpie@192.168.0.57:/tmp/vendorflow-frontend/

# Or if already on Pi, copy from current location
sudo cp -r /home/mkpie/Downloads/New\ MK/vendor_deploy/vendorflow-deploy/frontend/dist/* /opt/vendorflow/frontend/dist/
```

### Step 2: Create Frontend Directory Structure
```bash
# Create frontend directory
sudo mkdir -p /opt/vendorflow/frontend/dist

# Set proper permissions
sudo chown -R mkpie:mkpie /opt/vendorflow/frontend
sudo chmod -R 755 /opt/vendorflow/frontend
```

### Step 3: Deploy Frontend Files
```bash
# Copy built files from outputs directory
sudo cp -r dist/* /opt/vendorflow/frontend/dist/

# Verify files
ls -la /opt/vendorflow/frontend/dist/
```

Expected output:
```
drwxr-xr-x 3 mkpie mkpie 4096 Nov 24 17:12 .
drwxr-xr-x 3 mkpie mkpie 4096 Nov 24 17:12 ..
drwxr-xr-x 2 mkpie mkpie 4096 Nov 24 17:12 assets
-rw-r--r-- 1 mkpie mkpie 1767 Nov 24 17:12 index.html
```

---

## 🔧 Nginx Configuration

### Step 4: Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/vendorflow
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name 192.168.0.57 mkpie.local localhost;

    # Frontend - Serve static files
    location / {
        root /opt/vendorflow/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for long-running operations
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket support for real-time logs (if implemented)
    location /ws/ {
        proxy_pass http://127.0.0.1:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 5: Enable and Test Nginx
```bash
# Enable the site
sudo ln -sf /etc/nginx/sites-available/vendorflow /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx
```

---

## 🔐 Backend Service Configuration

### Step 6: Verify Backend Service
```bash
# Check if service exists
sudo systemctl status vendorflow-backend

# If not, create the service file
sudo nano /etc/systemd/system/vendorflow-backend.service
```

Service file content:
```ini
[Unit]
Description=VendorFlow Backend API
After=network.target

[Service]
Type=simple
User=mkpie
Group=mkpie
WorkingDirectory=/opt/vendorflow/backend
Environment="PATH=/opt/vendorflow/backend/venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/opt/vendorflow/backend/venv/bin/python -m uvicorn backend_integrated:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Step 7: Enable and Start Services
```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable vendorflow-backend
sudo systemctl enable nginx

# Start/restart services
sudo systemctl restart vendorflow-backend
sudo systemctl restart nginx

# Check status
sudo systemctl status vendorflow-backend
sudo systemctl status nginx
```

---

## ✅ Testing & Verification

### Step 8: Test Frontend Access
```bash
# Test from Raspberry Pi
curl -I http://localhost

# Test from another device on the network
# Open browser: http://192.168.0.57
```

Expected response:
```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
```

### Step 9: Test Backend API
```bash
# Test API health endpoint
curl http://localhost/api/health

# Or directly to backend
curl http://127.0.0.1:8000/health
```

Expected response:
```json
{"status": "healthy", "timestamp": "2024-11-24T17:15:00Z"}
```

### Step 10: Test Full Integration
1. **Open browser** to `http://192.168.0.57`
2. **Verify UI loads** - You should see the VendorFlow dashboard
3. **Check all tabs** - Dashboard, Scraping, Tags, Weights, Eniture, Settings
4. **Test file upload** - Try uploading a test file in Scraping tab
5. **Monitor logs** - Check right panel for activity logs

---

## 📊 Monitoring & Logs

### View Application Logs
```bash
# Backend logs
sudo journalctl -u vendorflow-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Check Service Status
```bash
# All services
systemctl list-units --type=service | grep vendor

# Specific service details
sudo systemctl status vendorflow-backend --no-pager
```

---

## 🌐 Network Access Options

### Local Network Access (Current)
- **URL**: `http://192.168.0.57`
- **Access**: Only from local network
- **Setup**: Already configured

### Option 1: Public Access via DuckDNS (Free)
```bash
# Install DuckDNS client
sudo apt-get install curl

# Create update script
sudo nano /usr/local/bin/duckdns.sh
```

Script content:
```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=YOUR-DOMAIN&token=YOUR-TOKEN&ip=" | curl -k -o /var/log/duckdns.log -K -
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/duckdns.sh

# Add to crontab
crontab -e
# Add line: */5 * * * * /usr/local/bin/duckdns.sh >/dev/null 2>&1

# Port forward on router: 80 -> 192.168.0.57:80
```

### Option 2: Cloudflare Tunnel (Free, Recommended)
```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb

# Login and configure
cloudflared tunnel login
cloudflared tunnel create vendorflow
cloudflared tunnel route dns vendorflow vendorflow.yourdomain.com

# Create config
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

Config content:
```yaml
tunnel: YOUR-TUNNEL-ID
credentials-file: /home/mkpie/.cloudflared/YOUR-TUNNEL-ID.json

ingress:
  - hostname: vendorflow.yourdomain.com
    service: http://localhost:80
  - service: http_status:404
```

```bash
# Install as service
sudo cloudflared service install
sudo systemctl start cloudflared
```

---

## 🔒 Security Hardening (Optional)

### Add Basic Authentication
```bash
# Install apache2-utils
sudo apt-get install apache2-utils

# Create password file
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Update nginx config - add to location / block:
auth_basic "VendorFlow Access";
auth_basic_user_file /etc/nginx/.htpasswd;

# Reload nginx
sudo systemctl reload nginx
```

### Enable HTTPS with Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate (requires public domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## 🛠️ Troubleshooting

### Frontend Not Loading
```bash
# Check nginx is running
sudo systemctl status nginx

# Check file permissions
ls -la /opt/vendorflow/frontend/dist/

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t
```

### Backend Not Responding
```bash
# Check backend service
sudo systemctl status vendorflow-backend

# Check backend logs
sudo journalctl -u vendorflow-backend -n 100 --no-pager

# Check if port 8000 is listening
sudo netstat -tlnp | grep 8000

# Restart backend
sudo systemctl restart vendorflow-backend
```

### API Calls Failing
```bash
# Test backend directly
curl http://127.0.0.1:8000/health

# Test through nginx
curl http://localhost/api/health

# Check nginx proxy configuration
sudo nginx -T | grep proxy_pass
```

### Database/File Permissions
```bash
# Check working directory permissions
ls -la /opt/vendorflow/backend/

# Fix if needed
sudo chown -R mkpie:mkpie /opt/vendorflow/
sudo chmod -R 755 /opt/vendorflow/
```

---

## 📦 Backup & Restore

### Backup Configuration
```bash
# Create backup directory
mkdir -p ~/vendorflow-backups/$(date +%Y%m%d)

# Backup configuration files
sudo cp /etc/nginx/sites-available/vendorflow ~/vendorflow-backups/$(date +%Y%m%d)/
sudo cp /etc/systemd/system/vendorflow-backend.service ~/vendorflow-backups/$(date +%Y%m%d)/

# Backup application data (if any)
sudo cp -r /opt/vendorflow/backend/data ~/vendorflow-backups/$(date +%Y%m%d)/ 2>/dev/null || true
```

### Automated Backup Script
```bash
sudo nano /usr/local/bin/backup-vendorflow.sh
```

Script content:
```bash
#!/bin/bash
BACKUP_DIR=~/vendorflow-backups/$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR
sudo cp /etc/nginx/sites-available/vendorflow $BACKUP_DIR/
sudo cp /etc/systemd/system/vendorflow-backend.service $BACKUP_DIR/
sudo cp -r /opt/vendorflow/backend/data $BACKUP_DIR/ 2>/dev/null || true
echo "Backup completed: $BACKUP_DIR"
```

---

## 🔄 Updates & Maintenance

### Update Frontend
```bash
# Build new version locally
npm run build

# Copy to Pi
scp -r dist/* mkpie@192.168.0.57:/opt/vendorflow/frontend/dist/

# No restart needed - just refresh browser
```

### Update Backend
```bash
# Stop service
sudo systemctl stop vendorflow-backend

# Update code
cd /opt/vendorflow/backend
git pull  # or copy new files

# Install dependencies
source venv/bin/activate
pip install -r requirements.txt

# Start service
sudo systemctl start vendorflow-backend
```

### System Updates
```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade

# Reboot if kernel updated
sudo reboot
```

---

## 💡 Performance Tips

### Optimize Nginx
```bash
# Edit nginx.conf
sudo nano /etc/nginx/nginx.conf

# Add/update in http block:
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
client_max_body_size 100M;
```

### Monitor Resources
```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check CPU usage
htop

# Check process list
ps aux | grep vendor
```

---

## 📞 Quick Reference

### Service Commands
```bash
# Restart all services
sudo systemctl restart vendorflow-backend nginx

# Stop all services
sudo systemctl stop vendorflow-backend nginx

# View logs
sudo journalctl -u vendorflow-backend -f

# Check status
systemctl status vendorflow-backend nginx
```

### Useful URLs
- **Frontend**: http://192.168.0.57
- **Backend API**: http://192.168.0.57/api/
- **Backend Direct**: http://127.0.0.1:8000
- **Health Check**: http://192.168.0.57/api/health

### File Locations
- **Frontend**: `/opt/vendorflow/frontend/dist/`
- **Backend**: `/opt/vendorflow/backend/`
- **Nginx Config**: `/etc/nginx/sites-available/vendorflow`
- **Service File**: `/etc/systemd/system/vendorflow-backend.service`
- **Logs**: `/var/log/nginx/` and `journalctl`

---

## ✨ You're Done!

Your VendorFlow system is now fully deployed on Raspberry Pi!

**Access your application**: http://192.168.0.57

**Next Steps**:
1. Test all automation features
2. Configure API credentials in Settings tab
3. Set up automated backups
4. Consider adding public access (DuckDNS/Cloudflare)
5. Monitor logs for any issues

**Power Usage**: ~$2/month electricity cost in Chicago
**Uptime**: 24/7 with systemd auto-restart
**Access**: Local network (optional: internet via tunnel)

Enjoy your fully functional, self-hosted VendorFlow automation system! 🚀
