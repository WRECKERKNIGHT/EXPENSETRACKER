# 🚀 SpendSmart Production Deployment

Complete production deployment guide for SpendSmart Expense Tracker.

## 📋 Quick Summary

- **Frontend**: React 19 + TypeScript + Vite (dist/)
- **Backend**: Express + TypeScript (backend/dist/)
- **Database**: SQLite (default) or PostgreSQL (production)
- **Build**: Pre-built, ready for deployment
- **Recommended Platforms**: Railway (both) or Vercel (frontend) + Railway (backend)

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

```bash
# 1. All changes committed
git status  # Should be clean

# 2. Build succeeds
npm run build
cd backend && npm run build && cd ..

# 3. No TypeScript errors
npx tsc --noEmit

# 4. Environment files created
ls -la .env.production
ls -la backend/.env.production

# 5. Verify dist folder exists
ls -la dist/
ls -la backend/dist/
```

## 🚀 Deployment Options

### Option 1: Railway (Easiest - Recommended)

Railway handles infrastructure, database, and deployment automatically.

**Cost**: Free tier available, $5/month for production

**Setup**:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy backend
cd backend
railway up

# 4. Get backend URL from Railway dashboard
# Example: https://spendsmart-backend.railway.app

# 5. Update frontend .env.production
echo "VITE_API_BASE=https://spendsmart-backend.railway.app/api" > ../.env.production

# 6. Deploy frontend on Railway or Vercel
cd ..
railway up  # OR deploy to Vercel
```

### Option 2: Vercel (Frontend) + Railway (Backend)

**Cost**: Vercel free tier (~100GB bandwidth), Railway $5/month

**Setup**:

```bash
# 1. Deploy backend to Railway (see Option 1, steps 1-3)

# 2. Get backend URL from Railway dashboard

# 3. Update frontend environment
echo "VITE_API_BASE=https://your-railway-backend.railway.app/api" > .env.production

# 4. Deploy frontend to Vercel
npm install -g vercel
vercel --prod

# 5. Add environment variable in Vercel dashboard
# VITE_API_BASE = https://your-railway-backend.railway.app/api

# 6. Redeploy on Vercel
vercel --prod
```

### Option 3: Render (Both Services)

**Cost**: Free tier available, $7/month for production

**Setup**:

```bash
# 1. Go to https://dashboard.render.com
# 2. Create new Web Service
# 3. Connect your GitHub repository
# 4. Configure:
#    - Build: cd backend && npm install && npm run build
#    - Start: cd backend && npm start
# 5. Set environment variables:
#    - JWT_SECRET: (generate below)
#    - NODE_ENV: production
#    - DATABASE_PATH: /var/lib/spendsmart/app.db
# 6. Deploy!
# 7. Get public URL
# 8. Create second service for frontend with:
#    - Build: npm run build
#    - Start: npm run preview
#    - Env: VITE_API_BASE=https://your-render-backend-url/api
```

## 🔑 Generate JWT Secret

```bash
openssl rand -base64 32
# Copy the output and use as JWT_SECRET in production
```

## 📝 Environment Configuration

### Frontend (.env.production)

```bash
# Set this to your deployed backend URL
VITE_API_BASE=https://your-backend-domain.com/api

# Examples:
# Railway: https://spendsmart-backend.railway.app/api
# Render: https://spendsmart-backend.onrender.com/api
# Vercel Edge: https://spendsmart-api.vercel.app/api
```

### Backend (backend/.env.production)

```bash
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)  # Generate this!
PORT=5000
DATABASE_PATH=/var/lib/spendsmart/app.db
CORS_ORIGIN=https://your-frontend-domain.com  # Critical for security!
```

## 🧪 Test Production Deployment

After deployment, test these endpoints:

```bash
# 1. Health check
curl https://your-backend.com/api/health
# Expected: {"status":"OK","message":"SpendSmart API is running"}

# 2. Register user
curl -X POST https://your-backend.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User"
  }'

# 3. Login
curl -X POST https://your-backend.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# 4. Get current user (use token from login)
curl -X GET https://your-backend.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 5. Create expense
curl -X POST https://your-backend.com/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "category": "Food",
    "description": "Lunch",
    "date": "2024-01-15"
  }'
```

## 📊 Automated Deployment Scripts

We've included deployment scripts for convenience:

```bash
# Preparation script (builds and validates)
./deploy.sh

# Railway deployment
./deploy-railway.sh

# Render setup guide
./deploy-render.sh

# Vercel frontend deployment
./deploy-vercel.sh
```

## 🔒 Security Checklist

Before going live:

- [ ] JWT_SECRET is strong and random (`openssl rand -base64 32`)
- [ ] CORS_ORIGIN matches exactly your frontend domain
- [ ] HTTPS/SSL enabled (automatic on all platforms)
- [ ] Database backups enabled
- [ ] Rate limiting configured (optional, add to backend)
- [ ] Error logs monitored
- [ ] No sensitive data in git history
- [ ] Environment variables not committed to git
- [ ] Backend CORS rejects requests from unknown origins

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
railway logs  # for Railway
# or check Render/platform dashboard

# Verify environment variables
echo $JWT_SECRET
echo $DATABASE_PATH

# Test locally first
cd backend
npm run dev
# Should start on http://localhost:5000
```

### CORS errors

```bash
# Update CORS_ORIGIN in backend/.env.production
# Must match exactly: https://yourdomain.com (no trailing slash)

# Restart backend after changing
```

### API requests fail

```bash
# Verify VITE_API_BASE in frontend .env
cat .env.production

# Check backend is running
curl https://your-backend.com/api/health

# Check token format
curl -H "Authorization: Bearer YOUR_TOKEN" ...
```

### Database errors

```bash
# For SQLite: verify path has write permissions
# For PostgreSQL: verify connection string

# Check database exists
ls -la /var/lib/spendsmart/app.db  # SQLite
# OR test PostgreSQL connection
psql postgresql://user:pass@host/db
```

## 📈 Performance Optimization

### Frontend

- ✅ Already optimized with Vite (code splitting, minification)
- ✅ Production build: ~926KB (acceptable for SPA)
- Optional: Add image optimization service (Cloudinary, ImageKit)

### Backend

- Add caching layer (Redis for session storage)
- Implement database connection pooling
- Add rate limiting to API endpoints
- Set up CDN for static assets (Cloudflare)

## 🔄 Continuous Deployment

Setup automatic deployment on every push:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: cd backend && npm run build && cd ..
      - run: npx tsc --noEmit
      - name: Deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up
```

## 📞 Support

- **Railway**: https://docs.railway.app
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **GitHub**: https://github.com/WRECKERKNIGHT/EXPENSETRACKER

## 🎉 After Deployment

1. ✅ Test all features in production
2. ✅ Monitor error logs
3. ✅ Share with users
4. ✅ Set up feedback channel
5. ✅ Plan feature roadmap

---

## Quick Start - Railway (Recommended)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create project
railway project create

# 4. Deploy
railway up

# 5. Get URL
railway service view --json | grep "publicUrl"

# 6. Profit! 🎉
```

For more details, see `PRODUCTION_SETUP.md`.
