const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting CropConnect smart contract deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

  // Deploy ProduceLedger contract
  console.log("\n📦 Deploying ProduceLedger contract...");
  const ProduceLedger = await ethers.getContractFactory("ProduceLedger");
  const produceLedger = await ProduceLedger.deploy();
  await produceLedger.deployed();
  console.log("✅ ProduceLedger deployed to:", produceLedger.address);

  // Deploy PaymentManager contract
  console.log("\n💳 Deploying PaymentManager contract...");
  const PaymentManager = await ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy(produceLedger.address);
  await paymentManager.deployed();
  console.log("✅ PaymentManager deployed to:", paymentManager.address);

  // Grant initial roles
  console.log("\n🔐 Setting up initial roles...");
  
  // Grant admin roles to deployer
  await produceLedger.grantRole(await produceLedger.ADMIN_ROLE(), deployer.address);
  await paymentManager.grantRole(await paymentManager.ADMIN_ROLE(), deployer.address);
  console.log("✅ Admin roles granted to deployer");

  // Create deployment info object
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ProduceLedger: {
        address: produceLedger.address,
        transactionHash: produceLedger.deployTransaction.hash,
        blockNumber: produceLedger.deployTransaction.blockNumber
      },
      PaymentManager: {
        address: paymentManager.address,
        transactionHash: paymentManager.deployTransaction.hash,
        blockNumber: paymentManager.deployTransaction.blockNumber
      }
    },
    gasUsed: {
      ProduceLedger: (await produceLedger.deployTransaction.wait()).gasUsed.toString(),
      PaymentManager: (await paymentManager.deployTransaction.wait()).gasUsed.toString()
    }
  };

  // Save deployment info to file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentFile}`);

  // Generate contract addresses file for frontend
  const contractAddresses = {
    PRODUCE_LEDGER_ADDRESS: produceLedger.address,
    PAYMENT_MANAGER_ADDRESS: paymentManager.address,
    NETWORK_NAME: hre.network.name,
    CHAIN_ID: (await ethers.provider.getNetwork()).chainId
  };

  const addressesFile = path.join(__dirname, "../contract-addresses.json");
  fs.writeFileSync(addressesFile, JSON.stringify(contractAddresses, null, 2));
  console.log(`📄 Contract addresses saved to: ${addressesFile}`);

  // Generate ABI files for frontend
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const abiDir = path.join(__dirname, "../abi");
  
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  // Copy ProduceLedger ABI
  const produceLedgerArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactsDir, "ProduceLedger.sol/ProduceLedger.json"))
  );
  fs.writeFileSync(
    path.join(abiDir, "ProduceLedger.json"),
    JSON.stringify(produceLedgerArtifact.abi, null, 2)
  );

  // Copy PaymentManager ABI
  const paymentManagerArtifact = JSON.parse(
    fs.readFileSync(path.join(artifactsDir, "PaymentManager.sol/PaymentManager.json"))
  );
  fs.writeFileSync(
    path.join(abiDir, "PaymentManager.json"),
    JSON.stringify(paymentManagerArtifact.abi, null, 2)
  );

  console.log("📄 ABI files generated in /abi directory");

  // Verification instructions
  console.log("\n🔍 Contract Verification:");
  console.log("To verify contracts on Etherscan, run:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${produceLedger.address}`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${paymentManager.address} "${produceLedger.address}"`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`Network: ${hre.network.name}`);
  console.log(`ProduceLedger: ${produceLedger.address}`);
  console.log(`PaymentManager: ${paymentManager.address}`);
  console.log(`Deployer: ${deployer.address}`);
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
