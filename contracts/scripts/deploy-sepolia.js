const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying PulseNet contracts to Sepolia...");

  // Check if we have the required environment variables
  if (!process.env.SEPOLIA_URL || !process.env.PRIVATE_KEY) {
    console.error("❌ Please set SEPOLIA_URL and PRIVATE_KEY in your .env file");
    console.log("📝 Example:");
    console.log("SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID");
    console.log("PRIVATE_KEY=your_private_key_without_0x_prefix");
    process.exit(1);
  }

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.error("❌ Deployer account has no ETH. Please add Sepolia ETH to your account.");
    console.log("💰 Get Sepolia ETH from: https://sepoliafaucet.com/");
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
    network: hre.network.name,
    chainId: hre.network.config.chainId,
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
    etherscanUrls: {
      PulseToken: `https://sepolia.etherscan.io/address/${pulseTokenAddress}`,
      PulseNet: `https://sepolia.etherscan.io/address/${pulseNetAddress}`
    }
  };

  fs.writeFileSync(
    'deployment-sepolia.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Update frontend config
  const frontendConfigPath = path.join(__dirname, '../../frontend/src/config/networks.js');
  if (fs.existsSync(frontendConfigPath)) {
    let configContent = fs.readFileSync(frontendConfigPath, 'utf8');
    
    // Update the contract addresses in the config
    configContent = configContent.replace(
      /PulseNet: '0x0000000000000000000000000000000000000000'/,
      `PulseNet: '${pulseNetAddress}'`
    );
    configContent = configContent.replace(
      /PulseToken: '0x0000000000000000000000000000000000000000'/,
      `PulseToken: '${pulseTokenAddress}'`
    );
    
    fs.writeFileSync(frontendConfigPath, configContent);
    console.log("✅ Updated frontend configuration with new contract addresses");
  }

  // Update backend .env
  const backendEnvPath = path.join(__dirname, '../../backend/.env');
  if (fs.existsSync(backendEnvPath)) {
    let envContent = fs.readFileSync(backendEnvPath, 'utf8');
    
    envContent = envContent.replace(
      /PULSENET_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000/,
      `PULSENET_CONTRACT_ADDRESS=${pulseNetAddress}`
    );
    envContent = envContent.replace(
      /PULSE_TOKEN_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000/,
      `PULSE_TOKEN_CONTRACT_ADDRESS=${pulseTokenAddress}`
    );
    
    fs.writeFileSync(backendEnvPath, envContent);
    console.log("✅ Updated backend configuration with new contract addresses");
  }

  console.log("\n🎉 Sepolia deployment completed!");
  console.log("📋 Contract addresses saved to deployment-sepolia.json");
  console.log("\n📊 Contract Details:");
  console.log("- PulseToken:", pulseTokenAddress);
  console.log("- PulseNet:", pulseNetAddress);
  console.log("\n🔍 View on Etherscan:");
  console.log("- PulseToken:", deploymentInfo.etherscanUrls.PulseToken);
  console.log("- PulseNet:", deploymentInfo.etherscanUrls.PulseNet);
  
  console.log("\n📝 Next steps:");
  console.log("1. Verify contracts on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${pulseTokenAddress} "${deployer.address}"`);
  console.log(`   npx hardhat verify --network sepolia ${pulseNetAddress} "${pulseTokenAddress}" "${deployer.address}"`);
  console.log("2. Update your .env files with the actual contract addresses");
  console.log("3. Restart your backend and frontend services");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
