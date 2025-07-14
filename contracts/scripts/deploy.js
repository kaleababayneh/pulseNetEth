const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PulseNet contracts...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  // Deploy PulseToken
  console.log("\n📄 Deploying PulseToken...");
  const PulseToken = await hre.ethers.getContractFactory("PulseToken");
  const pulseToken = await PulseToken.deploy(deployer.address);
  await pulseToken.waitForDeployment();
  console.log("✅ PulseToken deployed to:", await pulseToken.getAddress());

  // Deploy PulseNet
  console.log("\n📄 Deploying PulseNet...");
  const PulseNet = await hre.ethers.getContractFactory("PulseNet");
  const pulseNet = await PulseNet.deploy(await pulseToken.getAddress(), deployer.address);
  await pulseNet.waitForDeployment();
  console.log("✅ PulseNet deployed to:", await pulseNet.getAddress());

  // Transfer tokens to PulseNet contract for rewards
  console.log("\n💰 Transferring tokens to PulseNet for rewards...");
  const rewardPool = hre.ethers.parseEther("100000"); // 100k tokens for rewards
  await pulseToken.transfer(await pulseNet.getAddress(), rewardPool);
  console.log("✅ Transferred 100k PULSE tokens to PulseNet contract");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      PulseToken: await pulseToken.getAddress(),
      PulseNet: await pulseNet.getAddress()
    },
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 Deployment completed!");
  console.log("📋 Contract addresses saved to deployment.json");
  console.log("\n📊 Summary:");
  console.log("- PulseToken:", await pulseToken.getAddress());
  console.log("- PulseNet:", await pulseNet.getAddress());
  console.log("- Network:", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
