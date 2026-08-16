# SpendSmart - AI Expense Tracker

A comprehensive expense tracking application with SMS parsing, bank connections, and AI-powered financial advisor.

## Features

✨ **Core Features:**
- User authentication and profile management
- Real-time expense tracking
- SMS transaction parsing
- Bank account connections
- AI-powered financial advisor
- Detailed analytics and charts
- EMI and loan tracking
- Multi-category expense organization

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- SQLite3

## Installation & Setup

### 1. Install Frontend Dependencies

```bash
cd /workspaces/EXPENSETRACKER
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Start Frontend (in another terminal)

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Project Structure

```
├── App.tsx                      # Main app component
├── index.tsx                    # Entry point
├── types.ts                     # TypeScript type definitions
├── components/                  # React components
│   ├── Overview.tsx            # Dashboard overview
│   ├── ExpenseList.tsx         # Expense management
│   ├── Advisor.tsx             # AI advisor
│   ├── AddExpenseModal.tsx     # Add expense form
│   ├── SetupWizard.tsx        # Initial setup
│   └── SpaceBackground.tsx    # Background effect
├── services/                    # API and storage services
│   ├── apiService.ts          # Backend API calls
│   ├── geminiService.ts       # Google Gemini AI
│   └── storageService.ts      # LocalStorage utilities
├── backend/                     # Express backend
│   ├── server.ts              # Main server
│   ├── database.ts            # SQLite setup
│   ├── authService.ts         # Authentication
│   ├── expenseService.ts      # Expense management
│   ├── bankService.ts         # Bank & SMS services
│   └── package.json
└── README.md
```

## Authentication Flow

1. **Signup**: Users create account with name, email, password, and initial financial info
2. **Setup Wizard**: After signup, users add fixed monthly expenses and EMIs
3. **Login**: Users can login with email/password to access their data
4. **Session**: Token-based authentication with JWT

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/bulk` - Bulk create expenses

### Bank Integration
- `POST /api/bank/connect` - Connect bank account
- `GET /api/bank/connections` - Get connected banks
- `DELETE /api/bank/connections/:id` - Disconnect bank

### SMS Parsing
- `POST /api/sms/parse` - Parse SMS transaction
- `GET /api/sms/transactions` - Get SMS transactions

## Features in Detail

### SMS Scanning
The app can parse SMS messages from banks and automatically categorize transactions:
- Detects transaction amount
- Categorizes based on keywords (grocery, fuel, food, etc.)
- Creates expense entries automatically

### Bank Connections
- Connect real bank accounts
- Sync transactions automatically
- Real-time balance updates

### Financial Dashboard
- View balance, income, and expenses
- Category-wise spending breakdown
- Monthly cash flow trends
- Financial health indicator

### AI Advisor
- Get personalized financial recommendations
- Analyze spending patterns
- Budget suggestions using Google Gemini AI

## Configuration

### Environment Variables

**Frontend (.env in root):**
```
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```

**Backend (backend/.env):**
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
DATABASE_URL=spendsmart.db
```

## Build & Deploy

### Build Frontend
```bash
npm run build
```

### Build Backend
```bash
cd backend
npm run build
cd ..
```

## Database

The application uses SQLite3 for data persistence. Database file is automatically created at `backend/spendsmart.db`

### Tables
- `users` - User profiles and credentials
- `expenses` - User expenses and income
- `bankConnections` - Connected bank accounts
- `smsTransactions` - Parsed SMS transactions

## Troubleshooting

### Backend not connecting
- Ensure backend is running on port 5000
- Check if `spendsmart.db` exists in backend directory
- Check console for errors

### SMS Parsing not working
- Ensure message format includes amount (Rs., ₹, INR)
- Check category keywords in `backend/bankService.ts`

### Bank Connection fails
- This is a mock implementation in development
- Real implementation would require OAuth integration with bank APIs

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
