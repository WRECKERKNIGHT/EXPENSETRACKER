#!/bin/bash

# 🚀 SpendSmart Express Production Deploy
# This script guides you through deploying to Railway in 5 minutes

set -e

echo "🎯 SpendSmart Express Deploy to Railway"
echo "========================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v git &> /dev/null; then
  echo "❌ Git not found. Please install Git."
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌ npm not found. Please install Node.js"
  exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# Step 1: Verify build
echo "🔨 Step 1: Building application..."
if npm run build > /dev/null 2>&1; then
  echo "✅ Frontend build successful"
else
  echo "❌ Frontend build failed"
  npm run build  # Show errors
  exit 1
fi

if cd backend && npm run build > /dev/null 2>&1 && cd .. 2>&1; then
  echo "✅ Backend build successful"
else
  echo "❌ Backend build failed"
  cd ..
  exit 1
fi

# Step 2: Check git
echo ""
echo "📦 Step 2: Git status..."
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ Git working directory is clean"
else
  echo "⚠️  Uncommitted changes detected"
  echo "   Committing changes..."
  git add -A
  git commit -m "chore: prepare production deployment" || true
fi

# Step 3: Ensure Railway CLI
echo ""
echo "🚀 Step 3: Checking Railway CLI..."
if ! command -v railway &> /dev/null; then
  echo "📥 Installing Railway CLI..."
  npm install -g @railway/cli
fi
echo "✅ Railway CLI ready"

# Step 4: Push to GitHub
echo ""
echo "📤 Step 4: Pushing to GitHub..."
git push origin main
echo "✅ Pushed to GitHub"

# Step 5: Guide user through Railway
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Ready for Railway Deployment!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 IMPORTANT: Secrets Generation"
echo "   Before deploying, generate a JWT secret:"
echo ""
echo "   Run this command:"
echo "   $ openssl rand -base64 32"
echo ""
echo "   Copy the generated secret - you'll need it in Railway."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 To deploy on Railway:"
echo ""
echo "   1. Go to: https://railway.app"
echo "   2. Sign in with GitHub (or create account)"
echo "   3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "   4. Select 'EXPENSETRACKER'"
echo "   5. Railway auto-detects railway.json configuration"
echo "   6. Set Environment Variables:"
echo "      JWT_SECRET = <paste the secret from above>"
echo "      NODE_ENV = production"
echo "   7. Click 'Deploy'"
echo "   8. Wait 3-5 minutes for deployment"
echo "   9. Get your backend URL from Railway dashboard"
echo ""
echo "10. Deploy Frontend:"
echo "    - Option A: Update .env.production with backend URL"
echo "    - Option B: Deploy to Vercel (recommended)"
echo "      $ npm install -g vercel"
echo "      $ vercel --prod"
echo "      Set VITE_API_BASE environment variable"
echo ""
echo "✅ After deployment, test with:"
echo "   $ curl https://your-backend-url/api/health"
echo ""
echo "📚 For more details, see:"
echo "   - PRODUCTION_SETUP.md (comprehensive guide)"
echo "   - DEPLOYMENT.md (all deployment options)"
echo "   - PRODUCTION_STATUS.md (deployment status)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Happy deploying! 🎉"
