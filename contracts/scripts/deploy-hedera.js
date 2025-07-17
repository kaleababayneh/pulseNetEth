const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying PulseNet contracts to Hedera Testnet...");

  // Check if we have the required environment variables
  if (!process.env.HEDERA_URL || !process.env.PRIVATE_KEY) {
    console.error("❌ Please set HEDERA_URL and PRIVATE_KEY in your .env file");
    console.log("📝 Example:");
    console.log("HEDERA_URL=https://testnet.hashio.io/api");
    console.log("PRIVATE_KEY=your_private_key_without_0x_prefix");
    process.exit(1);
  }

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "HBAR");
  
  if (balance === 0n) {
    console.error("❌ Deployer account has no HBAR. Please add Hedera testnet HBAR to your account.");
    console.log("💰 Get Hedera testnet HBAR from: https://portal.hedera.com/");
    process.exit(1);
  }

  // Deploy PulseToken
  console.log("\n📄 Deploying PulseToken...");
  const PulseToken = await hre.ethers.getContractFactory("PulseToken");
  const pulseToken = await PulseToken.deploy(deployer.address);
  await pulseToken.waitForDeployment();
  const pulseTokenAddress = await pulseToken.getAddress();
  console.log("✅ PulseToken deployed to:", pulseTokenAddress);

  // Deploy PulseNet
  console.log("\n📄 Deploying PulseNet...");
  const PulseNet = await hre.ethers.getContractFactory("PulseNet");
  const pulseNet = await PulseNet.deploy(pulseTokenAddress, deployer.address);
  await pulseNet.waitForDeployment();
  const pulseNetAddress = await pulseNet.getAddress();
  console.log("✅ PulseNet deployed to:", pulseNetAddress);

  // Authorize PulseNet to mint tokens
  console.log("\n🔐 Authorizing PulseNet to mint PULSE tokens...");
  const authTx = await pulseToken.setPulseNetContract(pulseNetAddress);
  await authTx.wait();
  console.log("✅ PulseNet is now authorized to mint PULSE tokens as rewards");
  console.log("💡 Tokens will be minted directly to users when they submit health data");

  // Save deployment info
  const deploymentInfo = {
    network: "hedera-testnet",
    chainId: 296, // Hedera testnet chain ID
    deployer: deployer.address,
    contracts: {
      PulseToken: pulseTokenAddress,
      PulseNet: pulseNetAddress
    },
    blockNumbers: {
      PulseToken: (await pulseToken.deploymentTransaction()).blockNumber,
      PulseNet: (await pulseNet.deploymentTransaction()).blockNumber
    },
    timestamp: new Date().toISOString(),
    explorerUrls: {
      PulseToken: `https://hashscan.io/testnet/contract/${pulseTokenAddress}`,
      PulseNet: `https://hashscan.io/testnet/contract/${pulseNetAddress}`
    }
  };

  fs.writeFileSync(
    'deployment-hedera.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Update frontend config for Hedera
  const frontendConfigPath = path.join(__dirname, '../../frontend/src/config/networks.js');
  if (fs.existsSync(frontendConfigPath)) {
    let configContent = fs.readFileSync(frontendConfigPath, 'utf8');
    
    // Add Hedera testnet configuration if not exists
    if (!configContent.includes('hedera')) {
      const hederaConfig = `
  hedera: {
    chainId: 296,
    name: 'Hedera Testnet',
    nativeCurrency: {
      name: 'HBAR',
      symbol: 'HBAR',
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ['https://testnet.hashio.io/api']
      }
    },
    blockExplorers: {
      default: {
        name: 'HashScan',
        url: 'https://hashscan.io/testnet'
      }
    },
    contracts: {
      PulseNet: '${pulseNetAddress}',
      PulseToken: '${pulseTokenAddress}'
    }
  },`;
      
      configContent = configContent.replace(
        /sepolia: {/,
        `hedera: ${hederaConfig.trim()}\n  sepolia: {`
      );
    } else {
      // Update existing Hedera config
      configContent = configContent.replace(
        /PulseNet: '0x[a-fA-F0-9]{40}'/g,
        `PulseNet: '${pulseNetAddress}'`
      );
      configContent = configContent.replace(
        /PulseToken: '0x[a-fA-F0-9]{40}'/g,
        `PulseToken: '${pulseTokenAddress}'`
      );
    }
    
    fs.writeFileSync(frontendConfigPath, configContent);
    console.log("✅ Updated frontend configuration with Hedera contract addresses");
  }

  // Update backend .env for Hedera
  const backendEnvPath = path.join(__dirname, '../../backend/.env');
  if (fs.existsSync(backendEnvPath)) {
    let envContent = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Update RPC URL for Hedera
    envContent = envContent.replace(
      /ETHEREUM_RPC_URL=.*/,
      `ETHEREUM_RPC_URL=https://testnet.hashio.io/api`
    );
    
    // Update contract addresses
    envContent = envContent.replace(
      /PULSENET_CONTRACT_ADDRESS=.*/,
      `PULSENET_CONTRACT_ADDRESS=${pulseNetAddress}`
    );
    envContent = envContent.replace(
      /PULSE_TOKEN_CONTRACT_ADDRESS=.*/,
      `PULSE_TOKEN_CONTRACT_ADDRESS=${pulseTokenAddress}`
    );
    
    fs.writeFileSync(backendEnvPath, envContent);
    console.log("✅ Updated backend configuration with Hedera contract addresses");
  }

  // Update frontend .env for Hedera
  const frontendEnvPath = path.join(__dirname, '../../frontend/.env');
  if (fs.existsSync(frontendEnvPath)) {
    let envContent = fs.readFileSync(frontendEnvPath, 'utf8');
    
    envContent = envContent.replace(
      /VITE_ETHEREUM_RPC_URL=.*/,
      `VITE_ETHEREUM_RPC_URL=https://testnet.hashio.io/api`
    );
    
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log("✅ Updated frontend .env for Hedera network");
  }

  console.log("\n🎉 Hedera deployment completed!");
  console.log("📋 Contract addresses saved to deployment-hedera.json");
  console.log("\n📊 Contract Details:");
  console.log("- PulseToken:", pulseTokenAddress);
  console.log("- PulseNet:", pulseNetAddress);
  console.log("\n🔍 View on HashScan:");
  console.log("- PulseToken:", deploymentInfo.explorerUrls.PulseToken);
  console.log("- PulseNet:", deploymentInfo.explorerUrls.PulseNet);
  
  console.log("\n📝 Next steps:");
  console.log("1. Verify contracts on HashScan (if needed)");
  console.log("2. Update your .env files with the actual contract addresses");
  console.log("3. Restart your backend and frontend services");
  console.log("4. Test the application with Hedera testnet");
  console.log("\n💡 Note: Make sure your wallet is connected to Hedera testnet (Chain ID: 296)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
