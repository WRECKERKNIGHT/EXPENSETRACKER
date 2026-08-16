# SpendSmart Backend Deployment Guide

This guide covers deploying the SpendSmart backend to production using Render, Railway, or Heroku.

## Option 1: Deploy to Render (Recommended)

### Steps:
1. **Create Render Account**: Go to https://render.com and sign up
2. **Connect GitHub**: Link your GitHub account in Render dashboard
3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Select your GitHub repo (EXPENSETRACKER)
   - Name: `spendsmart-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm run start`
4. **Add Environment Variables** in Render dashboard:
   - `JWT_SECRET`: (generate a strong random string, e.g., `openssl rand -base64 32`)
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Render assigns automatically)
5. **Deploy**: Click "Deploy"
6. **Get URL**: Your backend will be at `https://spendsmart-backend.onrender.com`

**Note**: Render free tier may spin down after 15 min of inactivity. Use paid tier for production.

---

## Option 2: Deploy to Railway

### Steps:
1. **Create Railway Account**: Go to https://railway.app and sign up
2. **Create New Project**: Click "New Project"
3. **Add GitHub Repo**: Connect your GitHub repo
4. **Select Deployment Directory**: Choose `backend/`
5. **Add Environment Variables**:
   - Go to "Variables" tab
   - Add: `JWT_SECRET` (strong random value)
   - Add: `NODE_ENV=production`
6. **Deploy**: Railway auto-deploys on git push
7. **Get URL**: Go to "Deployments" tab to find your service URL

**Cost**: Free tier includes $5/month credit.

---

## Option 3: Deploy to Heroku

### Steps:
1. **Create Heroku Account**: Go to https://heroku.com and sign up
2. **Install Heroku CLI**: `brew install heroku` (macOS) or download from heroku.com
3. **Login**: `heroku login`
4. **Create App**:
   ```bash
   cd /workspaces/EXPENSETRACKER
   heroku create spendsmart-backend
   ```
5. **Set Environment Variables**:
   ```bash
   heroku config:set JWT_SECRET="your-strong-random-key"
   heroku config:set NODE_ENV="production"
   ```
6. **Deploy Backend**:
   ```bash
   git subtree push --prefix backend heroku main
   ```
7. **Get URL**: `https://spendsmart-backend.herokuapp.com`

---

## Post-Deployment

### Verify Backend is Running:
```bash
curl https://your-backend-url/api/health
# Should return: {"status":"OK","message":"SpendSmart API is running"}
```

### Update Frontend API URL:
1. Edit `.env.local` in frontend root:
   ```env
   VITE_API_BASE=https://your-backend-url/api
   ```
2. Or update `services/apiService.ts` directly:
   ```typescript
   const API_URL = process.env.VITE_API_BASE || 'https://your-backend-url/api';
   ```
3. Rebuild and redeploy frontend to Netlify

---

## Database

The backend uses SQLite (`spendsmart.db`) which is:
- **Local** (file-based) on initial deployment
- **Persisted** in Render/Railway/Heroku ephemeral filesystems (data lost on restart)

For production, consider migrating to PostgreSQL or MongoDB:
1. Create database (Render, Railway, or managed service)
2. Update `backend/database.ts` to use PostgreSQL instead of SQLite
3. Redeploy

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized on API calls | Check JWT_SECRET matches frontend and backend |
| CORS errors | Verify backend has `cors()` middleware (already included) |
| Database empty | SQLite resets on deploy if not persisted; use PostgreSQL for production |
| Slow deployments | Free tier services may be slow; upgrade for faster builds |

---

## Security Checklist

- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] NODE_ENV=production
- [ ] CORS is restricted (update in `backend/server.ts` if needed)
- [ ] Database credentials never in git
- [ ] Use HTTPS (provided by all deployment services)

