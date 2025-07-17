# PulseNet Hedera Deployment Guide

## Prerequisites

1. **Get Hedera Testnet HBAR**
   - Visit: https://portal.hedera.com/
   - Create an account and get testnet HBAR

2. **Set up Environment Variables**
   Create a `.env` file in the contracts directory:
   ```
   HEDERA_URL=https://testnet.hashio.io/api
   PRIVATE_KEY=your_private_key_without_0x_prefix
   ```

## Deployment Steps

1. **Compile Contracts**
   ```bash
   cd contracts
   npm run compile
   ```

2. **Deploy to Hedera Testnet**
   ```bash
   npm run deploy:hedera
   ```

3. **Verify Deployment**
   - Check the generated `deployment-hedera.json` file
   - Visit the HashScan URLs to verify contracts on the explorer

## Network Configuration

- **Chain ID**: 296
- **Network Name**: Hedera Testnet
- **RPC URL**: https://testnet.hashio.io/api
- **Block Explorer**: https://hashscan.io/testnet
- **Native Currency**: HBAR

## Post-Deployment

After successful deployment:

1. **Update Frontend Configuration**
   - The deployment script automatically updates `frontend/src/config/networks.js`
   - Add Hedera testnet to your wallet (Chain ID: 296)

2. **Update Backend Configuration**
   - The deployment script automatically updates `backend/.env`
   - Restart your backend service

3. **Test the Application**
   - Connect your wallet to Hedera testnet
   - Test health data submission
   - Verify token rewards

## Troubleshooting

- **Insufficient HBAR**: Get more testnet HBAR from the Hedera portal
- **Network Issues**: Ensure your wallet is connected to Hedera testnet
- **Contract Verification**: Use HashScan to verify contract deployment

## Useful Links

- [Hedera Developer Portal](https://portal.hedera.com/)
- [HashScan Explorer](https://hashscan.io/testnet)
- [Hedera Documentation](https://docs.hedera.com/)
