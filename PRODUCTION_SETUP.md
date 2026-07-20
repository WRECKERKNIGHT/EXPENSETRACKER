# Production Deployment Guide

This guide covers production deployment of SpendSmart Expense Tracker to Railway, Render, or custom hosting.

## 🚀 Quick Start - Railway (Recommended)

Railway is the easiest option for deploying both frontend and backend.

### Step 1: Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### Step 2: Deploy Backend to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select `EXPENSETRACKER`
5. Railway will auto-detect `railway.json` and deploy the backend
6. Set environment variables in Railway dashboard:
   - `JWT_SECRET`: Generate via `openssl rand -base64 32`
   - `NODE_ENV`: `production`
   - `DATABASE_PATH`: `/var/lib/spendsmart/app.db`

7. Get your backend URL from Railway (e.g., `https://spendsmart-backend.railway.app`)

### Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Set environment variables:
   - `VITE_API_BASE`: Set to your Railway backend URL (e.g., `https://spendsmart-backend.railway.app/api`)
6. Deploy!

### Step 4: Update DNS (Optional)

Connect custom domains:
- Backend: Point `api.yourdomain.com` to Railway
- Frontend: Point `yourdomain.com` to Vercel

---

## 🌐 Alternative: Deploy Both to Railway

Railway can host both frontend and backend.

### Backend Deployment

Railway already has `railway.json` configured. Just connect GitHub and Railway will auto-deploy.

### Frontend Deployment

Create a separate Railway project:

1. Create `railway-frontend.json`:

```json
{
  "name": "spendsmart-frontend",
  "displayName": "SpendSmart Frontend",
  "services": [
    {
      "key": "web",
      "type": "web",
      "plan": "free",
      "buildCommand": "npm run build",
      "startCommand": "npm run preview",
      "envVars": [
        {
          "key": "VITE_API_BASE",
          "value": "https://spendsmart-backend.railway.app/api"
        }
      ]
    }
  ]
}
```

2. Deploy frontend project to Railway
3. Update `VITE_API_BASE` to point to your backend Railway URL

---

## 🎯 Alternative: Deploy to Render

Render is similar to Railway with a generous free tier.

### Backend Deployment

1. Create `render.yaml` (already exists in your project)
2. Go to https://render.com
3. Create new "Web Service"
4. Connect GitHub repository
5. Set environment variables:
   - `JWT_SECRET`: Generate via `openssl rand -base64 32`
   - `NODE_ENV`: `production`

### Frontend Deployment

Create frontend on Vercel (Step 3 above) or:

1. Create separate Render service for frontend
2. Set build command: `npm run build`
3. Set start command: `npm run preview`
4. Set environment variable: `VITE_API_BASE=https://your-render-backend-url/api`

---

## 🔧 Production Configuration Checklist

### Backend (backend/.env.production)

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] `PORT=5000`
- [ ] `DATABASE_PATH` or `DATABASE_URL`
- [ ] `CORS_ORIGIN` set to your frontend domain

### Frontend (.env.production)

- [ ] `VITE_API_BASE` points to production backend URL

### Security

- [ ] JWT_SECRET is strong and unique
- [ ] CORS is configured for your domain only
- [ ] Database has automatic backups enabled
- [ ] HTTPS/SSL is enabled (automatic on Vercel/Railway/Render)
- [ ] Rate limiting is configured (add to server.ts if needed)

### Database

- [ ] SQLite database path is persistent (Railway/Render use `/var/lib/` or persistent volumes)
- [ ] Regular backups are scheduled
- [ ] Consider PostgreSQL for production (better concurrency)

---

## 📊 PostgreSQL for Production (Optional)

For better production reliability, use PostgreSQL instead of SQLite.

### Setup

1. Create PostgreSQL database on Railway/Render/AWS RDS
2. Get connection string: `postgresql://user:password@host:port/database`
3. Set `DATABASE_URL=postgresql://...` in backend environment
4. Update `backend/database.ts` to use PostgreSQL:

```typescript
import pg from 'pg';
const Pool = pg.Pool;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(sql: string, values?: any[]) {
  return pool.query(sql, values);
}
```

5. Run migrations to create tables (provided in `backend/migrations/` if exists)

---

## 🧪 Testing Production Deployment

After deployment, test these flows:

### Authentication Flow
```bash
# 1. Sign up
curl -X POST https://your-backend.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123",
    "name": "Test User"
  }'

# 2. Login
curl -X POST https://your-backend.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'

# 3. Get current user (with token from login response)
curl -X GET https://your-backend.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expense Management
```bash
# Create expense
curl -X POST https://your-backend.com/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "category": "Food",
    "description": "Lunch at restaurant",
    "date": "2024-01-15"
  }'

# Get expenses
curl -X GET https://your-backend.com/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Health Check
```bash
# Simple health check
curl https://your-backend.com/api/health
# Expected response: { "status": "OK", "message": "SpendSmart API is running" }
```

---

## 🔄 Continuous Deployment (CI/CD)

Add GitHub Actions for automatic deployment on push to main:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Frontend
        run: npm run build

      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Backend to Railway
        run: |
          npm install -g railway
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
```

---

## 🚨 Monitoring & Logging

### Enable Production Logging

Update `backend/server.ts`:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
```

### Setup Error Tracking

Optional: Use Sentry for error tracking:

1. Create account at https://sentry.io
2. Create project for Node.js
3. Add to backend:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

---

## 📱 Frontend Deployment Specifics

### Vercel

- ✅ Automatic builds on push
- ✅ Preview deployments for PRs
- ✅ Serverless functions support
- ✅ Free tier includes 100GB bandwidth/month

### Railway Frontend

- ✅ Auto-deploying from GitHub
- ✅ Persistent storage available
- ✅ Environment variables per service
- ✅ Custom domains

### Build Configuration

Both platforms support `npm run build` and `dist/` output directory as configured in `vite.config.ts`.

---

## 🔐 Environment Variables Summary

### Frontend (.env.production)
```
VITE_API_BASE=https://your-api-domain.com/api
```

### Backend (backend/.env.production)
```
NODE_ENV=production
JWT_SECRET=<generate with openssl rand -base64 32>
PORT=5000
DATABASE_PATH=/var/lib/spendsmart/app.db
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## ✅ Pre-Deployment Checklist

- [ ] All code is committed and pushed to GitHub
- [ ] Latest commit is on `main` branch
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] `.env.production` files are configured
- [ ] JWT_SECRET is generated and secure
- [ ] Database configuration is set
- [ ] CORS_ORIGIN matches your frontend domain
- [ ] All secrets are added to deployment platform
- [ ] Health check endpoint responds: `/api/health`

---

## 🆘 Troubleshooting

### Backend won't start
- Check logs: `railway logs` or Render dashboard
- Verify JWT_SECRET is set
- Check database path has write permissions
- Ensure NODE_ENV=production

### API requests failing (CORS)
- Verify CORS_ORIGIN matches frontend domain exactly
- Check Authorization header format: `Bearer <token>`
- Ensure VITE_API_BASE points to correct backend URL

### Frontend build fails
- Clear node_modules and rebuild: `rm -rf node_modules && npm install`
- Check Vite config: `vite.config.ts`
- Verify environment variables are set in deployment platform

### Database errors
- Check DATABASE_PATH has write permissions
- Verify SQLite file isn't corrupted: delete and re-initialize
- For PostgreSQL, verify connection string format

---

## 📞 Support

For Railway support: https://docs.railway.app
For Render support: https://render.com/docs
For Vercel support: https://vercel.com/docs

---

## 🎉 Next Steps After Deployment

1. Test all features in production
2. Monitor error logs and performance
3. Set up automated backups
4. Configure custom domain
5. Enable HTTPS/SSL (automatic on all platforms)
6. Share with users!
