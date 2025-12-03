#!/bin/bash

# Production Deployment to Railway
# This script automates deployment to Railway platform

set -e

echo "🚀 Deploying to Railway"
echo "======================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "Logging in to Railway..."
railway login

# Create/link project
echo ""
echo "Select or create a Railway project:"
railway project create || railway project select

# Deploy backend
echo ""
echo "Configuring backend service..."
cd backend

# Create railway.json if it doesn't exist
if [ ! -f "railway.json" ]; then
    cat > railway.json << 'EOF'
{
  "name": "spendsmart-backend",
  "displayName": "SpendSmart Backend API",
  "services": [
    {
      "key": "web",
      "type": "web",
      "plan": "free",
      "buildCommand": "npm install && npm run build",
      "startCommand": "npm start",
      "envVars": [
        {
          "key": "JWT_SECRET",
          "scope": "build,runtime",
          "generateValue": true
        },
        {
          "key": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
EOF
fi

echo "Deploying backend..."
railway up

# Get backend URL
BACKEND_URL=$(railway service get web --json | grep -o '"publicUrl":"[^"]*' | cut -d'"' -f4)
echo "Backend URL: $BACKEND_URL"

cd ..

# Save environment configuration
mkdir -p .railway
cat > .railway/config.json << EOF
{
  "backendUrl": "$BACKEND_URL"
}
EOF

echo ""
echo "✓ Backend deployed successfully!"
echo "Backend URL: $BACKEND_URL"
echo ""
echo "Next steps:"
echo "1. Update .env.production with VITE_API_BASE=$BACKEND_URL/api"
echo "2. Deploy frontend to Vercel: vercel --prod"
echo "3. Test the application"
echo ""
echo "For frontend deployment, use Vercel:"
echo "  npm i -g vercel"
echo "  vercel --prod"
