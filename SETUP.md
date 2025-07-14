# PulseNet MVP Setup Guide

This guide will help you set up and run the complete PulseNet MVP locally.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MetaMask** browser extension - [Download here](https://metamask.io/)
- **Git** - [Download here](https://git-scm.com/)

### System Requirements
- **Operating System**: macOS, Linux, or Windows (with WSL recommended)
- **RAM**: Minimum 4GB, recommended 8GB
- **Storage**: At least 2GB free space
- **Network**: Internet connection for downloading dependencies

## Quick Setup (Automated)

### Option 1: One-Command Setup
```bash
npm run setup
```

This will automatically:
- Install all dependencies
- Start local blockchain
- Deploy smart contracts  
- Start backend API server
- Start frontend application

### Option 2: Manual Setup

If you prefer to set up each component manually:

#### 1. Install Dependencies
```bash
npm run install-all
```

#### 2. Smart Contracts
```bash
cd contracts
npx hardhat node --hostname 127.0.0.1  # Terminal 1
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2
```

#### 3. Backend API
```bash
cd backend
cp .env.example .env  # Edit as needed
npm run dev
```

#### 4. Frontend Application
```bash
cd frontend
npm run dev
```

## MetaMask Configuration

### 1. Add Local Network
- Open MetaMask
- Click network dropdown → "Add Network"
- Enter the following details:
  - **Network Name**: Hardhat Local
  - **RPC URL**: http://127.0.0.1:8545
  - **Chain ID**: 1337
  - **Currency Symbol**: ETH

### 2. Import Test Account
When you start Hardhat node, it shows 20 test accounts. Import one:
- Copy a private key from the Hardhat console
- MetaMask → Account menu → Import Account
- Paste the private key

## Testing the Application

### 1. Connect Wallet
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select your test account
4. Approve the connection

### 2. Submit Health Data
1. Navigate to "Submit Data"
2. Enter sample health metrics:
   - Heart Rate: 72 BPM
   - Sleep Hours: 7.5
   - Steps: 8500
3. Click "Submit Data & Earn Rewards"
4. Approve the transaction in MetaMask

### 3. View Dashboard
1. Go to "My Dashboard" to see your submissions
2. Check "Buyer Dashboard" for platform statistics
3. Admin panel available at "/admin" (requires admin key)

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:3001 | REST API server |
| Blockchain | http://localhost:8545 | Local Ethereum node |
| API Health | http://localhost:3001/api/health | API status check |

## API Endpoints

### Health Data
- `POST /api/data/submit` - Submit health data
- `GET /api/data/stats` - Platform statistics  
- `GET /api/data/user/:address` - User statistics

### Rewards
- `POST /api/rewards/manual` - Manual reward (admin)
- `GET /api/rewards/balance/:address` - User balance
- `GET /api/rewards/leaderboard` - Top contributors

### System
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Frontend    │    │     Backend     │    │   Blockchain    │
│   (React App)   │◄──►│  (Express API)  │◄──►│   (Hardhat)     │
│                 │    │                 │    │                 │
│ • User Interface│    │ • ZK Simulation │    │ • Smart Contract│
│ • Wallet Connect│    │ • Data Storage  │    │ • Token Rewards │
│ • Data Submission│   │ • API Routes    │    │ • Event Logging │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Troubleshooting

### Common Issues

#### "MetaMask RPC Error"
- Make sure Hardhat node is running
- Check RPC URL is correct: http://127.0.0.1:8545
- Try switching MetaMask networks and back

#### "Failed to fetch" errors
- Ensure backend is running on port 3001
- Check firewall/antivirus blocking connections
- Try restarting the backend service

#### "Contract deployment failed"
- Make sure Hardhat node is running first
- Check no other services using port 8545
- Clear browser cache and MetaMask data

#### "Insufficient funds" in MetaMask
- Make sure you imported a test account from Hardhat
- Check you're on the correct network (Chain ID: 1337)
- Restart Hardhat node to reset balances

### Reset Everything
```bash
# Stop all running services (Ctrl+C)
npm run clean          # Remove all node_modules
npm run install-all    # Reinstall dependencies
npm run setup          # Start fresh
```

### Logs and Debugging
- Backend logs: Check terminal running `npm run dev` in backend/
- Frontend logs: Check browser console (F12)
- Blockchain logs: Check terminal running `npx hardhat node`
- Transaction details: View in MetaMask activity

## Development

### Adding New Features
1. **Smart Contract**: Modify contracts in `contracts/contracts/`
2. **Backend API**: Add routes in `backend/routes/`
3. **Frontend UI**: Add components in `frontend/src/components/`

### Testing
```bash
# Smart contracts
cd contracts && npx hardhat test

# Backend API (when available)
cd backend && npm test

# Frontend (when available)  
cd frontend && npm test
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
ETHEREUM_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key
ADMIN_KEY=your_admin_key
```

#### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Production Deployment

### Smart Contracts
- Deploy to testnet (Sepolia) or mainnet
- Update contract addresses in backend
- Verify contracts on Etherscan

### Backend
- Deploy to cloud provider (Railway, Heroku, etc.)
- Set production environment variables
- Configure CORS for frontend domain

### Frontend  
- Build for production: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Update API base URL

## Security Considerations

### MVP Limitations
- ZK proofs are simulated (not real)
- Admin authentication is basic
- Local storage used for data
- No encryption at rest

### Production Requirements
- Implement real ZK proof system
- Add proper authentication/authorization
- Use encrypted database storage
- Enable HTTPS everywhere
- Add rate limiting and monitoring

## Support

For issues or questions:
1. Check this guide first
2. Look at console logs for error details
3. Try the troubleshooting steps
4. Search existing issues in the repository

## Next Steps

Once you have the MVP running:
1. Explore the admin panel features
2. Try submitting multiple data entries
3. Check the buyer dashboard analytics
4. Experiment with the API endpoints
5. Consider contributing improvements!
