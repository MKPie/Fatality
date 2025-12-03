#!/bin/bash
# VendorFlow Backend Startup Script

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Starting VendorFlow Backend...${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install -r requirements.txt --quiet

# Create data directories
mkdir -p /home/mkpie/vendor_data/process
mkdir -p /home/mkpie/vendor_data/final

# Check Chrome/Chromium
if ! command -v chromium-browser &> /dev/null && ! command -v google-chrome &> /dev/null; then
    echo -e "${RED}Chrome/Chromium not found. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y chromium-browser chromium-chromedriver
fi

# Start server
echo -e "${GREEN}Starting FastAPI server on port 8000...${NC}"
echo -e "${GREEN}API available at: http://localhost:8000${NC}"
echo -e "${GREEN}Docs available at: http://localhost:8000/docs${NC}"

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
