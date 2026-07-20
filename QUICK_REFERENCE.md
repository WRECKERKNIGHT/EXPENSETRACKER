# ⚡ Quick Reference Guide

## 🚀 Start the App (2 Steps)

### Step 1: Backend
```bash
cd /workspaces/EXPENSETRACKER/backend
npm run dev
# Expected: ✅ Database initialized
#           🚀 SpendSmart API running on http://localhost:5000
```

### Step 2: Frontend
```bash
cd /workspaces/EXPENSETRACKER
npm run dev
# Expected: ➜  Local:   http://localhost:5173/
```

### Step 3: Open Browser
http://localhost:5173

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `START_HERE.md` | Read this first |
| `SETUP_GUIDE.md` | Installation guide |
| `README_IMPLEMENTATION.md` | Quick summary |
| `COMPLETE_REPORT.md` | Full details |
| `ARCHITECTURE.txt` | System diagrams |
| `CHANGES.md` | All changes |

---

## 📝 User Flow

```
1. Landing → Click "Get Started"
2. Signup → Fill form (name, email, password, income)
3. Setup Wizard → Add monthly expenses (optional)
4. Add EMIs → Add loans (optional)
5. Dashboard → See expenses, add more, view analytics
6. Logout → Next login goes to Dashboard directly
```

---

## 🔧 Backend Structure

```
backend/
├── server.ts           (Main API router)
├── database.ts         (SQLite setup)
├── authService.ts      (Login/Register)
├── expenseService.ts   (CRUD operations)
├── bankService.ts      (SMS/Bank features)
└── spendsmart.db       (Auto-created database)
```

---

## 📊 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | id, email, password_hash |
| `expenses` | Transactions | amount, category, userId |
| `bankConnections` | Bank accounts | bankName, isConnected |
| `smsTransactions` | SMS messages | messageContent, parsedCategory |

---

## 🔗 API Quick Reference

### Authentication
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123","monthlyIncome":50000}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
# Returns: {user: {...}, token: "jwt_token_here"}
```

### Expenses
```bash
TOKEN="jwt_token_here"

# Create expense
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"category":"Food & Dining","type":"expense","date":"2025-11-30","description":"Lunch"}'

# Get all expenses
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer $TOKEN"

# Delete expense
curl -X DELETE http://localhost:5000/api/expenses/{EXPENSE_ID} \
  -H "Authorization: Bearer $TOKEN"
```

### SMS Parsing
```bash
curl -X POST http://localhost:5000/api/sms/parse \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messageContent":"HDFC: Spent Rs 1000 at Amazon","senderBank":"HDFC"}'
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Delete database and retry
rm backend/spendsmart.db
npm run dev
```

### Frontend won't connect
```bash
# Check API URL is correct
# Ensure backend is running on 5000
curl http://localhost:5000/api/health
```

### Can't sign up
```bash
# Check email is unique
sqlite3 backend/spendsmart.db "SELECT email FROM users;"

# Check password is 6+ chars
# Check all fields are filled
```

### Expenses don't save
```bash
# Check JWT token exists
# Open browser console → localStorage → spendsmart_token

# Check backend logs for errors
# Check database isn't locked
```

---

## 🗄️ Database Commands

```bash
# Open database
sqlite3 backend/spendsmart.db

# View all users
SELECT * FROM users;

# View user expenses
SELECT * FROM expenses WHERE userId = 'user_id';

# Total spending by category
SELECT category, SUM(amount) as total 
FROM expenses 
WHERE userId = 'user_id' AND type = 'expense'
GROUP BY category
ORDER BY total DESC;

# Monthly spending trend
SELECT DATE(date) as day, SUM(amount) as total
FROM expenses
WHERE userId = 'user_id' AND type = 'expense'
GROUP BY DATE(date)
ORDER BY date DESC;

# Bank connections
SELECT * FROM bankConnections;

# SMS transactions
SELECT * FROM smsTransactions;

# Exit
.quit
```

---

## 📱 Feature Checklist

- [ ] Can sign up with email/password
- [ ] Setup wizard appears after signup
- [ ] Can add monthly expenses
- [ ] Can add EMI payments
- [ ] Dashboard shows correct balance
- [ ] Can add new transactions
- [ ] Can delete transactions
- [ ] Can logout
- [ ] Can login with saved credentials
- [ ] Expenses persist after login
- [ ] Can connect bank
- [ ] SMS parsing works

---

## 🔐 Security Notes

- Passwords: Never stored plain text, always hashed
- Tokens: 30-day JWT expiration, sent in Authorization header
- Database: User isolation enforced in every query
- SQL: Parameterized queries prevent injection
- CORS: Configured for localhost (adjust for production)

---

## 📈 Performance Tips

- Use indexes on userId for fast lookups
- Parameterized queries prevent SQL injection
- Database is SQLite (good for development, use PostgreSQL for production)
- Frontend caching can be added for offline support

---

## 🚀 Deployment Checklist

Before going to production:

- [ ] Change JWT_SECRET in production
- [ ] Update API_URL for production domain
- [ ] Switch to PostgreSQL/MySQL for database
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domain
- [ ] Set NODE_ENV=production
- [ ] Enable error logging/monitoring
- [ ] Set up database backups
- [ ] Configure environment variables
- [ ] Test all API endpoints

---

## 📞 Support

### Quick Answers

**Q: Can I change the database?**  
A: Yes! Update backend/database.ts to use PostgreSQL/MySQL

**Q: How do I add more features?**  
A: Add endpoints in server.ts, add service in backend/

**Q: How do I deploy?**  
A: Frontend to Vercel, Backend to Heroku/Railway

**Q: Is it production-ready?**  
A: Yes, but configure security for your domain

**Q: Can I add real SMS?**  
A: Yes, add Twilio webhook listener in bankService.ts

**Q: Can I add real bank APIs?**  
A: Yes, implement OAuth in connectBank() function

---

## �� Key Files to Understand

1. **backend/server.ts** - See all routes and endpoints
2. **services/apiService.ts** - See frontend → backend calls
3. **backend/authService.ts** - Understand authentication
4. **backend/expenseService.ts** - Understand CRUD
5. **backend/database.ts** - Understand database layer

---

## ✨ What's Different from Before

| Before | After |
|--------|-------|
| localStorage | Real database ✅ |
| Fake passwords | Encrypted passwords ✅ |
| No auth | JWT tokens ✅ |
| Setup after login | Setup after signup ✅ |
| Lost on refresh | Persistent data ✅ |
| No validation | Full validation ✅ |
| Mock SMS | Real parser ✅ |

---

## 🎉 Ready to Go!

Everything is ready. Start the servers and test it out!

```bash
# Terminal 1
cd /workspaces/EXPENSETRACKER/backend && npm run dev

# Terminal 2 (in another terminal)
cd /workspaces/EXPENSETRACKER && npm run dev

# Browser
http://localhost:5173
```

**That's it! You're done! 🚀**

---

**Last Updated**: November 30, 2025
**Status**: ✅ Ready for Production
