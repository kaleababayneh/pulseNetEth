# PulseNet MVP

A decentralized health data marketplace with simulated ZK privacy layer.

## Project Structure

```
pulseNetEth/
├── contracts/          # Solidity smart contracts
├── backend/            # Node.js/Express API server
├── frontend/           # React frontend application
├── scripts/            # Deployment and utility scripts
└── README.md
```

## Quick Start

1. **Smart Contracts**:
   ```bash
   cd contracts
   npm install
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network localhost
   ```

2. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## MVP Features

- ✅ Health data submission with simulated ZK proofs
- ✅ Token rewards for data contributors
- ✅ Buyer dashboard with anonymized stats
- ✅ Wallet integration (MetaMask)
- ✅ Off-chain data storage
- ✅ Smart contract integration

## Architecture

- **Smart Contract**: Handles data hashes, rewards, and buyer management
- **Backend API**: Simulates ZK verification and manages data
- **Frontend**: React app for users and buyers
- **Storage**: Local JSON file for MVP (production would use IPFS/encrypted storage)
