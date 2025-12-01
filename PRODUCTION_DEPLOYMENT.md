# SpendSmart - Production Deployment Checklist

This document outlines the complete setup required to deploy SpendSmart to production.

## Prerequisites

- GitHub account with repo access (WRECKERKNIGHT/EXPENSETRACKER)
- Deployment platform account (Render, Railway, or Heroku)
- Domain name (optional, platforms provide free subdomains)

---

## Backend Deployment

### Step 1: Choose a Platform

| Platform | Free Tier | Setup Time | Recommended |
|----------|-----------|-----------|-------------|
| **Render** | Limited | 5 min | ✅ Yes (simplest) |
| **Railway** | $5/month | 5 min | ✅ Yes |
| **Heroku** | Deprecated | N/A | ❌ No |

### Step 2: Deploy Backend

**Using Render:**
```bash
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select EXPENSETRACKER repo
5. Set Build Command: cd backend && npm install
6. Set Start Command: cd backend && npm start
7. Add Environment: JWT_SECRET (generate random string)
8. Deploy and note the URL
```

**Using Railway:**
```bash
1. Go to https://railway.app
2. Sign up with GitHub
3. Create "New Project" → "Deploy from GitHub repo"
4. Select EXPENSETRACKER
5. Add root path: backend/
6. Add Variables: JWT_SECRET (random string)
7. Deploy and get URL from Deployments tab
```

### Step 3: Test Backend

```bash
# Replace with your backend URL
BACKEND_URL="https://your-backend.onrender.com"

# Test health endpoint
curl $BACKEND_URL/api/health

# Expected: {"status":"OK","message":"SpendSmart API is running"}
```

---

## Frontend Deployment

### Step 1: Create `.env.local`

```bash
cd /workspaces/EXPENSETRACKER

# Create .env.local with your backend URL
cat > .env.local << EOF
VITE_API_BASE=https://your-backend-url/api
EOF
```

Replace `https://your-backend-url/api` with your actual backend URL from Step 2.

### Step 2: Build Frontend

```bash
npm run build
```

Verify `dist/` folder is created and contains `index.html` and `assets/`.

### Step 3: Deploy to Netlify

**Option A: Via Netlify UI**
```
1. Go to https://netlify.com
2. Sign up with GitHub
3. Connect EXPENSETRACKER repo
4. Set Build Command: npm run build
5. Set Publish Directory: dist
6. Add environment variable: VITE_API_BASE=https://your-backend-url/api
7. Deploy
```

**Option B: Via Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## Environment Variables Reference

### Backend (.env or deployment platform)

```bash
# Required
JWT_SECRET=<generate-strong-random-string>  # Min 32 chars
NODE_ENV=production

# Optional
PORT=5000  # Render/Railway/Heroku auto-assign
DATABASE_PATH=./spendsmart.db
```

### Frontend (.env.local or Netlify)

```bash
# Required for production
VITE_API_BASE=https://your-backend-url/api
```

---

## Post-Deployment Verification

### 1. Backend Health Check

```bash
curl https://your-backend-url/api/health
# Should return: {"status":"OK","message":"SpendSmart API is running"}
```

### 2. Frontend Access

Visit https://your-frontend-url and verify:
- Landing page loads
- Login/Signup forms appear
- No console errors

### 3. End-to-End Test

1. Create account at https://your-frontend-url/signup
2. Enter: name, email, password, salary (min 1000)
3. Should redirect to setup wizard
4. Add test expense
5. Verify balance updates

---

## Production Checklist

- [ ] Backend deployed and health check passing
- [ ] Frontend built with correct VITE_API_BASE
- [ ] Frontend deployed to Netlify
- [ ] CORS configured (should work with defaults)
- [ ] JWT_SECRET is strong (no default values)
- [ ] NODE_ENV=production on backend
- [ ] Database initialized on first run
- [ ] User can signup, login, add expenses
- [ ] CSV import works (test with sample CSV)
- [ ] SMS import works (test with pasted SMS)
- [ ] Auth persists on page refresh
- [ ] Logout clears session

---

## Troubleshooting

### "API is not responding"
- Verify backend URL is correct
- Check backend health: `curl your-backend-url/api/health`
- Check VITE_API_BASE environment variable

### "CORS error"
- Backend already has CORS enabled
- Verify frontend URL is allowed (should be default)
- Check browser console for specific error

### "401 Unauthorized"
- Backend JWT_SECRET must match frontend expectations
- Token should be stored in localStorage automatically
- Clear localStorage and try signup again

### "Database empty after deploy"
- SQLite is ephemeral on free tiers
- Recommend PostgreSQL for production
- See DEPLOYMENT_GUIDE.md for database migration steps

### "Build fails on Netlify"
- Verify .env.local has VITE_API_BASE set
- Check `npm run build` works locally
- View Netlify build logs for specific error

---

## Next Steps (Future Enhancements)

1. **Real Bank Integration**: Add Plaid OAuth flow
2. **Automatic SMS Sync**: Build mobile companion app
3. **Analytics Dashboard**: Add advanced reporting
4. **Mobile App**: React Native or Flutter version
5. **Multi-currency Support**: Add currency conversion
6. **Database Migration**: SQLite → PostgreSQL

---

## Support

For deployment issues, check:
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- Netlify Docs: https://docs.netlify.com

