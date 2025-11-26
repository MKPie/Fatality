# VendorFlow Quick Reference Card

## 🚀 ONE-COMMAND DEPLOYMENT
```bash
./deploy.sh
```

## 📍 Access URLs
- **Frontend**: http://192.168.0.57
- **Backend**: http://192.168.0.57:8000
- **API**: http://192.168.0.57/api/

## 🔧 Essential Commands

### Service Management
```bash
# Restart everything
sudo systemctl restart vendorflow-backend nginx

# Check status
sudo systemctl status vendorflow-backend nginx

# View logs
sudo journalctl -u vendorflow-backend -f
sudo tail -f /var/log/nginx/access.log
```

### Deployment
```bash
# Deploy frontend
sudo cp -r dist/* /opt/vendorflow/frontend/dist/

# Reload nginx
sudo systemctl reload nginx

# Restart backend
sudo systemctl restart vendorflow-backend
```

### Troubleshooting
```bash
# Test backend directly
curl http://localhost:8000/health

# Test frontend
curl -I http://localhost

# Check processes
ps aux | grep vendor
ps aux | grep nginx

# Check ports
sudo netstat -tlnp | grep -E ':(80|8000)'
```

## 📁 File Locations
- Frontend: `/opt/vendorflow/frontend/dist/`
- Backend: `/opt/vendorflow/backend/`
- Nginx: `/etc/nginx/sites-available/vendorflow`
- Service: `/etc/systemd/system/vendorflow-backend.service`

## 🔍 Quick Tests
```bash
# 1. Backend health
curl http://localhost:8000/health

# 2. Frontend loads
curl -I http://localhost | grep "200 OK"

# 3. API proxy works
curl http://localhost/api/health

# 4. Services running
systemctl is-active vendorflow-backend nginx
```

## ⚡ Quick Fixes

### Frontend not loading?
```bash
sudo systemctl restart nginx
sudo nginx -t
```

### Backend not responding?
```bash
sudo systemctl restart vendorflow-backend
sudo journalctl -u vendorflow-backend -n 50
```

### Permission errors?
```bash
sudo chown -R mkpie:mkpie /opt/vendorflow/
sudo chmod -R 755 /opt/vendorflow/
```

## 📊 Monitor Resources
```bash
# Memory
free -h

# Disk
df -h

# CPU & Processes
htop
```

## 🎯 Quick Actions After Deploy
1. Open http://192.168.0.57
2. Check all 6 tabs load
3. Test file upload in Scraping
4. Configure Settings (API keys)
5. Test from phone/laptop

## 🔐 Security (Optional)
```bash
# Add password protection
sudo htpasswd -c /etc/nginx/.htpasswd admin

# Enable HTTPS (requires domain)
sudo certbot --nginx -d yourdomain.com
```

## 💾 Backup
```bash
# Quick backup
mkdir ~/backup-$(date +%Y%m%d)
sudo cp -r /opt/vendorflow/ ~/backup-$(date +%Y%m%d)/
```

## 🌐 Make Public (Optional)

### DuckDNS (Free)
1. Register at duckdns.org
2. Port forward 80 → 192.168.0.57:80
3. Install duckdns client

### Cloudflare Tunnel (Free + HTTPS)
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb
cloudflared tunnel login
```

---

**Bookmark this file for quick reference!**
