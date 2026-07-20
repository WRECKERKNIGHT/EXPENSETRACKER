# 🚀 SpendSmart - Quick Deploy Card

## What You Have
✅ Full-stack expense tracker with React frontend + Express backend
✅ User auth (signup/login/logout)
✅ Expense management with charts
✅ SMS & CSV import features
✅ Production-ready code
✅ Deployment guides for Render/Railway/Heroku

---

## Deploy Backend in 5 Minutes

### Using Render (Easiest)
```
1. Go to render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo (EXPENSETRACKER)
4. Build: cd backend && npm install
5. Start: cd backend && npm start
6. Add env: JWT_SECRET = (random string)
7. Deploy ✓
```

Copy your backend URL: `https://your-service.onrender.com`

---

## Deploy Frontend in 3 Minutes

### Create .env.local
```bash
cd /workspaces/EXPENSETRACKER
echo "VITE_API_BASE=https://your-backend-url/api" > .env.local
```

### Build & Deploy to Netlify
```bash
npm run build
# Go to netlify.com → Connect GitHub → Deploy
# Add env var: VITE_API_BASE = your backend URL
```

Done! Your app is now live.

---

## Test Locally (Before Deploy)

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
npm run dev

# Browser: http://localhost:5173
# Signup → Setup → Add expense → Import CSV
```

---

## CSV Import Format
```csv
date,description,amount,type
2024-12-01,Groceries,1500,expense
2024-12-02,Salary,50000,credit
```

---

## Key URLs After Deploy
- **Frontend**: https://your-netlify-domain.netlify.app
- **Backend API**: https://your-backend-url/api
- **Health Check**: https://your-backend-url/api/health

---

## Environment Variables

### Backend (.env)
```
JWT_SECRET=your-strong-random-string
NODE_ENV=production
PORT=5000
```

### Frontend (.env.local)
```
VITE_API_BASE=https://your-backend-url/api
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| API not connecting | Check VITE_API_BASE in frontend env |
| 401 errors | Verify JWT_SECRET on backend |
| CSV upload fails | Ensure CSV has date, description, amount columns |
| Database empty | Backend uses ephemeral SQLite (use PostgreSQL for production) |

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Netlify
3. ✅ Test signup/login/expense flow
4. ✅ Share app link with users
5. Optional: Add PostgreSQL for persistent database
6. Optional: Integrate real bank API (Plaid)

---

**See DEPLOYMENT_GUIDE.md for detailed instructions**
**See IMPLEMENTATION_SUMMARY.md for full feature list**

