#!/bin/bash

# Production Deployment Script for SpendSmart
# This script prepares the application for production deployment

set -e

echo "🚀 SpendSmart Production Deployment Script"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Git Status
echo -e "${YELLOW}[1/7]${NC} Checking Git status..."
if [ -z "$(git status --porcelain)" ]; then
  echo -e "${GREEN}✓${NC} Git working directory is clean"
else
  echo -e "${RED}✗${NC} You have uncommitted changes. Please commit or stash them first."
  echo "Changes:"
  git status --porcelain
  exit 1
fi

# Step 2: Build Frontend
echo -e "${YELLOW}[2/7]${NC} Building frontend..."
npm run build
if [ -d "dist" ]; then
  DIST_SIZE=$(du -sh dist | cut -f1)
  echo -e "${GREEN}✓${NC} Frontend build successful (size: $DIST_SIZE)"
else
  echo -e "${RED}✗${NC} Build output directory 'dist' not found"
  exit 1
fi

# Step 3: Build Backend
echo -e "${YELLOW}[3/7]${NC} Building backend..."
cd backend
npm run build
if [ -d "dist" ]; then
  echo -e "${GREEN}✓${NC} Backend build successful"
else
  echo -e "${RED}✗${NC} Backend build output directory 'dist' not found"
  exit 1
fi
cd ..

# Step 4: TypeScript Check
echo -e "${YELLOW}[4/7]${NC} Running TypeScript check..."
npx tsc --noEmit
echo -e "${GREEN}✓${NC} No TypeScript errors"

# Step 5: Check Environment Files
echo -e "${YELLOW}[5/7]${NC} Checking environment files..."
if [ -f ".env.production" ]; then
  echo -e "${GREEN}✓${NC} Frontend .env.production exists"
else
  echo -e "${YELLOW}⚠${NC} .env.production not found (will use defaults)"
fi

if [ -f "backend/.env.production" ]; then
  echo -e "${GREEN}✓${NC} Backend .env.production exists"
else
  echo -e "${YELLOW}⚠${NC} backend/.env.production not found"
fi

# Step 6: Generate Deployment Summary
echo -e "${YELLOW}[6/7]${NC} Generating deployment summary..."
cat > DEPLOYMENT_SUMMARY.txt << EOF
SpendSmart Expense Tracker - Production Deployment Summary
Generated: $(date)

Frontend Build:
- Output: dist/
- Size: $DIST_SIZE
- Entry: dist/index.html
- Assets: dist/assets/

Backend Build:
- Output: backend/dist/
- Entry: backend/dist/server.js
- Runtime: Node.js

Environment Configuration:
- Frontend .env.production: $([ -f ".env.production" ] && echo "✓ Configured" || echo "⚠ Not configured")
- Backend .env.production: $([ -f "backend/.env.production" ] && echo "✓ Configured" || echo "⚠ Not configured")

Latest Commit:
$(git log -1 --format="%H | %s | %ai")

Git Status:
Branch: $(git rev-parse --abbrev-ref HEAD)
Commits: $(git rev-list --count HEAD)

Deployment Checklist:
- [ ] Set VITE_API_BASE in frontend .env.production
- [ ] Set JWT_SECRET in backend .env.production (generate with: openssl rand -base64 32)
- [ ] Set NODE_ENV=production in backend
- [ ] Configure database path or PostgreSQL connection string
- [ ] Test locally: npm run start:all
- [ ] Push to GitHub: git push origin main
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel/Railway/Render
- [ ] Run smoke tests against production
- [ ] Monitor error logs

For detailed deployment instructions, see: PRODUCTION_SETUP.md
EOF

echo -e "${GREEN}✓${NC} Deployment summary saved to DEPLOYMENT_SUMMARY.txt"

# Step 7: Display Instructions
echo ""
echo -e "${YELLOW}[7/7]${NC} Production deployment preparation complete!"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Review and update .env.production files with your production URLs"
echo "2. Generate JWT_SECRET: openssl rand -base64 32"
echo "3. Configure backend database (SQLite path or PostgreSQL)"
echo "4. Push changes: git push origin main"
echo "5. Deploy backend to Railway/Render (connect GitHub repo)"
echo "6. Deploy frontend to Vercel (connect GitHub repo)"
echo "7. Set VITE_API_BASE to your production backend URL"
echo "8. Test health endpoint: curl https://your-backend.com/api/health"
echo ""
echo "📖 For detailed instructions, see: PRODUCTION_SETUP.md"
echo ""
echo -e "${GREEN}✓ Ready for deployment!${NC}"
