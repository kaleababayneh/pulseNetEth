# Sepolia Deployment Guide

This guide will help you deploy PulseNet to the Ethereum Sepolia testnet.

## Prerequisites

### 1. Get Sepolia ETH
- Visit [Sepolia Faucet](https://sepoliafaucet.com/) or [Alchemy Faucet](https://sepoliafaucet.com/)
- Connect your MetaMask wallet
- Request test ETH (you'll need at least 0.1 ETH for deployment)

### 2. Get Infura Project ID
- Sign up at [Infura.io](https://infura.io)
- Create a new project
- Copy your Project ID

### 3. Get Your Private Key
- Open MetaMask
- Click on the three dots menu → Account Details → Export Private Key
- Enter your MetaMask password
- Copy the private key (without the 0x prefix)

⚠️ **SECURITY WARNING**: Never share your private key or commit it to version control!

## Configuration

### 1. Configure Contracts Environment
Edit `/contracts/.env`:
```bash
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x_prefix
ETHERSCAN_API_KEY=your_etherscan_api_key_optional
```

### 2. Configure Backend Environment
Edit `/backend/.env`:
```bash
# Update these lines:
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_without_0x_prefix

# Comment out localhost settings:
# ETHEREUM_RPC_URL=http://127.0.0.1:8545
# PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 3. Configure Frontend Network
The frontend is already configured to use Sepolia. No changes needed.

## Deployment Steps

### 1. Deploy Contracts to Sepolia
```bash
cd contracts
npm run deploy:sepolia
```

This will:
- Deploy PulseToken and PulseNet contracts
- Transfer reward tokens to the PulseNet contract
- Update frontend and backend configurations automatically
- Save deployment info to `deployment-sepolia.json`

### 2. Verify Contracts (Optional)
```bash
# Verify PulseToken
npx hardhat verify --network sepolia <PULSE_TOKEN_ADDRESS> "<DEPLOYER_ADDRESS>"

# Verify PulseNet
npx hardhat verify --network sepolia <PULSE_NET_ADDRESS> "<PULSE_TOKEN_ADDRESS>" "<DEPLOYER_ADDRESS>"
```

### 3. Restart Services
```bash
# Restart backend
cd ../backend
npm start

# Restart frontend
cd ../frontend
npm run dev
```

## MetaMask Configuration

### Add Sepolia Network (if not already added)
- Network Name: Sepolia Test Network
- RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
- Chain ID: 11155111
- Currency Symbol: ETH
- Block Explorer: https://sepolia.etherscan.io

### Import PULSE Token
After deployment, add the PULSE token to MetaMask:
- Token Address: (will be shown after deployment)
- Token Symbol: PULSE
- Decimals: 18

## Testing

1. Connect MetaMask to Sepolia network
2. Visit your frontend application
3. Connect your wallet
4. Submit health data to test the complete flow
5. Check transactions on [Sepolia Etherscan](https://sepolia.etherscan.io)

## Troubleshooting

### "Insufficient ETH" Error
- Get more Sepolia ETH from faucets
- Check your wallet balance

### "Network not supported" Error
- Ensure MetaMask is connected to Sepolia
- Check the frontend network configuration

### "Contract not found" Error
- Verify contracts were deployed successfully
- Check contract addresses in configuration files

### RPC URL Issues
- Try alternative Sepolia RPC URLs:
  - `https://rpc.sepolia.dev`
  - `https://ethereum-sepolia.blockpi.network/v1/rpc/public`
  - `https://eth-sepolia.public.blastapi.io`

## Useful Links

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io)
- [Infura Dashboard](https://infura.io/dashboard)
- [MetaMask Documentation](https://docs.metamask.io/)
