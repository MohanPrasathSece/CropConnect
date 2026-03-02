const hre = require("hardhat");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting AgriTrack smart contract deployment...");

    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);

    // 1. Deploy ProduceLedger contract
    console.log("\n📦 Deploying ProduceLedger...");
    const ProduceLedger = await ethers.getContractFactory("ProduceLedger");
    const produceLedger = await ProduceLedger.deploy();
    await produceLedger.waitForDeployment();
    const produceLedgerAddress = await produceLedger.getAddress();
    console.log("✅ ProduceLedger deployed to:", produceLedgerAddress);

    // 2. Deploy PaymentManager contract
    console.log("\n📦 Deploying PaymentManager...");
    const PaymentManager = await ethers.getContractFactory("PaymentManager");
    const paymentManager = await PaymentManager.deploy(produceLedgerAddress);
    await paymentManager.waitForDeployment();
    const paymentManagerAddress = await paymentManager.getAddress();
    console.log("✅ PaymentManager deployed to:", paymentManagerAddress);

    // 3. Deploy SupplyChainTracker contract
    console.log("\n📦 Deploying SupplyChainTracker...");
    const SupplyChainTracker = await ethers.getContractFactory("SupplyChainTracker");
    const supplyChainTracker = await SupplyChainTracker.deploy();
    await supplyChainTracker.waitForDeployment();
    const supplyChainTrackerAddress = await supplyChainTracker.getAddress();
    console.log("✅ SupplyChainTracker deployed to:", supplyChainTrackerAddress);

    // 4. Deploy OrderEscrow contract
    console.log("\n📦 Deploying OrderEscrow...");
    const OrderEscrow = await ethers.getContractFactory("OrderEscrow");
    const orderEscrow = await OrderEscrow.deploy(deployer.address); // Platform wallet
    await orderEscrow.waitForDeployment();
    const orderEscrowAddress = await orderEscrow.getAddress();
    console.log("✅ OrderEscrow deployed to:", orderEscrowAddress);

    // Grant roles to deployer for testing
    console.log("\n🔐 Granting roles to deployer...");
    const FARMER_ROLE = await produceLedger.FARMER_ROLE();
    await produceLedger.grantRole(FARMER_ROLE, deployer.address);
    console.log("✅ Granted FARMER_ROLE to deployer");

    const SUPPLY_FARMER_ROLE = await supplyChainTracker.FARMER_ROLE();
    await supplyChainTracker.grantRole(SUPPLY_FARMER_ROLE, deployer.address);
    console.log("✅ Granted FARMER_ROLE on SupplyChainTracker to deployer");

    // ---------------------------------------------------------
    // EXPORT TO CLIENT & SERVER
    // ---------------------------------------------------------
    console.log("\n📄 Exporting contract data...");
    const clientBlockchainDir = path.join(__dirname, "../../client/src/blockchain_data");
    const serverBlockchainDir = path.join(__dirname, "../../server/blockchain");

    [clientBlockchainDir, serverBlockchainDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Save Contract Addresses
    const contractAddresses = {
        PRODUCE_LEDGER_ADDRESS: produceLedgerAddress,
        PAYMENT_MANAGER_ADDRESS: paymentManagerAddress,
        SUPPLY_CHAIN_TRACKER_ADDRESS: supplyChainTrackerAddress,
        ORDER_ESCROW_ADDRESS: orderEscrowAddress,
        NETWORK_NAME: hre.network.name,
        DEPLOYED_AT: new Date().toISOString(),
        DEPLOYER_ADDRESS: deployer.address
    };

    [clientBlockchainDir, serverBlockchainDir].forEach(dir => {
        fs.writeFileSync(
            path.join(dir, "contract-addresses.json"),
            JSON.stringify(contractAddresses, null, 2)
        );
    });

    // Save ABIs
    const artifactsDir = path.join(__dirname, "../artifacts/contracts");

    const produceLedgerArtifact = JSON.parse(
        fs.readFileSync(path.join(artifactsDir, "ProduceLedger.sol/ProduceLedger.json"))
    );
    const paymentManagerArtifact = JSON.parse(
        fs.readFileSync(path.join(artifactsDir, "PaymentManager.sol/PaymentManager.json"))
    );
    const supplyChainTrackerArtifact = JSON.parse(
        fs.readFileSync(path.join(artifactsDir, "SupplyChainTracker.sol/SupplyChainTracker.json"))
    );
    const orderEscrowArtifact = JSON.parse(
        fs.readFileSync(path.join(artifactsDir, "OrderEscrow.sol/OrderEscrow.json"))
    );

    [clientBlockchainDir, serverBlockchainDir].forEach(dir => {
        fs.writeFileSync(
            path.join(dir, "ProduceLedger.json"),
            JSON.stringify(produceLedgerArtifact.abi, null, 2)
        );
        fs.writeFileSync(
            path.join(dir, "PaymentManager.json"),
            JSON.stringify(paymentManagerArtifact.abi, null, 2)
        );
        fs.writeFileSync(
            path.join(dir, "SupplyChainTracker.json"),
            JSON.stringify(supplyChainTrackerArtifact.abi, null, 2)
        );
        fs.writeFileSync(
            path.join(dir, "OrderEscrow.json"),
            JSON.stringify(orderEscrowArtifact.abi, null, 2)
        );
    });

    console.log("✅ ABI and Address files generated in:");
    console.log("   - client/src/blockchain_data");
    console.log("   - server/blockchain");

    console.log("\n🎉 All contracts deployed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("   ProduceLedger:", produceLedgerAddress);
    console.log("   PaymentManager:", paymentManagerAddress);
    console.log("   SupplyChainTracker:", supplyChainTrackerAddress);
    console.log("   OrderEscrow:", orderEscrowAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
