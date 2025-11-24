#!/bin/bash
# VendorFlow Quick Deploy Script
# Run this on your Raspberry Pi (MKpie) to deploy the frontend

set -e  # Exit on any error

echo "========================================"
echo "  VendorFlow Frontend Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Use: ./deploy.sh${NC}"
   exit 1
fi

# Step 1: Create directories
echo -e "${BLUE}[1/7] Creating directory structure...${NC}"
sudo mkdir -p /opt/vendorflow/frontend/dist
sudo chown -R $USER:$USER /opt/vendorflow/frontend
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 2: Copy built files
echo -e "${BLUE}[2/7] Copying frontend files...${NC}"
FRONTEND_PATH="/home/mkpie/Documents/New MK/vendor_deploy/vendorflow-deploy/frontend"
if [ -d "$FRONTEND_PATH/dist" ]; then
    sudo cp -r "$FRONTEND_PATH/dist/"* /opt/vendorflow/frontend/dist/
    echo -e "${GREEN}✓ Files copied${NC}"
else
    echo -e "${RED}✗ Frontend dist folder not found at: $FRONTEND_PATH/dist${NC}"
    echo -e "${RED}  Please run 'npm run build' first${NC}"
    exit 1
fi
echo ""

# Step 3: Create nginx config
echo -e "${BLUE}[3/7] Configuring nginx...${NC}"
sudo tee /etc/nginx/sites-available/vendorflow > /dev/null <<'EOF'
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://127.0.0.1:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
echo -e "${GREEN}✓ Nginx config created${NC}"
echo ""

# Step 4: Enable nginx site
echo -e "${BLUE}[4/7] Enabling nginx site...${NC}"
sudo ln -sf /etc/nginx/sites-available/vendorflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
echo -e "${GREEN}✓ Site enabled${NC}"
echo ""

# Step 5: Test nginx config
echo -e "${BLUE}[5/7] Testing nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx config valid${NC}"
else
    echo -e "${RED}✗ Nginx config error${NC}"
    exit 1
fi
echo ""

# Step 6: Restart services
echo -e "${BLUE}[6/7] Restarting services...${NC}"
sudo systemctl reload nginx
sudo systemctl restart vendorflow-backend || echo -e "${RED}Warning: Backend service restart failed${NC}"
echo -e "${GREEN}✓ Services restarted${NC}"
echo ""

# Step 7: Verify deployment
echo -e "${BLUE}[7/7] Verifying deployment...${NC}"

# Check nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
else
    echo -e "${RED}✗ Nginx is not running${NC}"
fi

# Check backend
if systemctl is-active --quiet vendorflow-backend; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
fi

# Check files
if [ -f "/opt/vendorflow/frontend/dist/index.html" ]; then
    echo -e "${GREEN}✓ Frontend files deployed${NC}"
else
    echo -e "${RED}✗ Frontend files missing${NC}"
fi

# Test frontend access
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo -e "${GREEN}✓ Frontend accessible${NC}"
else
    echo -e "${RED}✗ Frontend not accessible${NC}"
fi

# Test backend API
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health | grep -q "200"; then
    echo -e "${GREEN}✓ Backend API accessible${NC}"
else
    echo -e "${RED}✗ Backend API not accessible${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "========================================"
echo ""
echo "Access your application at:"
echo "  http://192.168.0.57"
echo "  http://localhost (from Raspberry Pi)"
echo ""
echo "To view logs:"
echo "  Frontend: sudo tail -f /var/log/nginx/access.log"
echo "  Backend:  sudo journalctl -u vendorflow-backend -f"
echo ""
echo "To check status:"
echo "  sudo systemctl status nginx vendorflow-backend"
echo ""
