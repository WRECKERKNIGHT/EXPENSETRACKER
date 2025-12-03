#!/bin/bash

# Production Deployment to Vercel
# This script automates frontend deployment to Vercel

set -e

echo "🚀 Deploying Frontend to Vercel"
echo "=============================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if built
if [ ! -d "dist" ]; then
    echo "Building frontend..."
    npm run build
fi

# Deploy
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "✓ Frontend deployed to Vercel!"
echo ""
echo "Next steps:"
echo "1. Visit the Vercel project URL from output above"
echo "2. Add environment variable: VITE_API_BASE"
echo "3. Redeploy to apply the environment variable"
echo ""
echo "Environment variable example:"
echo "  VITE_API_BASE=https://spendsmart-backend.railway.app/api"
echo ""
echo "For more details, see: PRODUCTION_SETUP.md"
