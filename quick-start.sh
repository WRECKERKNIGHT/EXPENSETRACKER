#!/bin/bash

# SpendSmart Quick Start Script

echo "🚀 SpendSmart - AI Expense Tracker"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo -e "${BLUE}Checking environment...${NC}"
NODE_VERSION=$(node -v)
echo "✓ Node version: $NODE_VERSION"

# Backend setup
echo ""
echo -e "${BLUE}Setting up backend...${NC}"
cd backend
echo "Installing backend dependencies..."
npm install > /dev/null 2>&1
echo "✓ Backend dependencies installed"
cd ..

# Frontend setup
echo ""
echo -e "${BLUE}Setting up frontend...${NC}"
echo "Installing frontend dependencies..."
npm install > /dev/null 2>&1
echo "✓ Frontend dependencies installed"

# Check if databases exist
echo ""
echo -e "${BLUE}Checking database...${NC}"
if [ -f "backend/spendsmart.db" ]; then
    echo "✓ Database exists (spendsmart.db)"
else
    echo "→ Database will be created on first backend run"
fi

# Display startup instructions
echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}To start the application:${NC}"
echo ""
echo "Option 1: Two Terminals (Recommended)"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: npm run dev"
echo ""
echo "Option 2: Start both from root"
echo "  npm run start:all"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:5000/api"
echo ""
echo -e "${YELLOW}Test the backend:${NC}"
echo "  curl http://localhost:5000/api/health"
echo ""
echo -e "${YELLOW}Quick Test:${NC}"
echo "  1. Sign up with email: test@example.com"
echo "  2. Add some monthly expenses"
echo "  3. Add an EMI"
echo "  4. View dashboard"
echo ""
