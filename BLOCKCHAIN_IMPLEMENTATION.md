# CropChain - Complete Blockchain Implementation Guide

This document outlines the end-to-end blockchain integration for the **CropChain** platform. We use **Ethereum (Hardhat)** for the decentralized ledger and **Ethers.js** for frontend/backend interactions.

## 🏗️ 1. Architecture Overview

- **Blockchain Engine**: Hardhat Network (EVM-compatible)
- **Smart Contracts**: 
  - `ProduceLedger.sol`: Core registry for crop production.
  - `SupplyChainTracker.sol`: Advanced state tracking for logistics.
  - `PaymentManager.sol`: Escrow and payment distribution.
  - `OrderEscrow.sol`: Secure fund holding until quality verification.
- **Backend Provider**: `ethers.providers.JsonRpcProvider` (connected to localhost:8545 or custom RPC).
- **Frontend Wallet**: MetaMask integration via `Web3Context.js`.

---

## 🔐 2. Automated Role Management

Blockchain roles are mapped to Supabase profile roles. We use an automated sync script to ensure every confirmed user has the appropriate blockchain permissions.

### Implementation:
- **Location**: `server/confirm-all-users.js`
- **Workflow**:
  1. Script fetches users from Supabase Auth.
  2. Confirms email if unconfirmed.
  3. Fetches profile for `wallet_address` and `role`.
  4. Calls `grantBlockchainRole(role, walletAddress)` on the contracts.

---

## 🌾 3. The Production Cycle (Farmer)

When a farmer lists a crop, it can be optionally recorded on the blockchain for immutable proof of origin.

### Implementation:
- **Location**: `client/src/pages/farmer/CropUpload.jsx`
- **Contract Call**: `ProduceLedger.registerProduce(...)`
- **Stored Data**:
  - `traceabilityId`: Unique ID returned by the contract.
  - `blockchain_hash`: Transaction hash stored in Supabase for verification.

---

## 🚚 4. The Collection & Quality Cycle (Aggregator)

Aggregators verify the crop quality using **Gemini IA Vision**. Once verified, the intake is committed to the blockchain.

### Implementation:
- **Location**: `server/routes/aggregator.js` (Route: `/collect-crop`)
- **Workflow**:
  1. AI analyzes uploaded sample images.
  2. Aggregator records intake in Supabase.
  3. Backend calls `updateProduceStatus` (to InTransit) and `updateQualityGrade` (to AI-detected grade).
  4. Both transaction hashes are stored in the database.

---

## 🖥️ 5. Traceability Discovery

The discovery engine allows anyone (Aggregators, Retailers, Consumers) to verify the lifecycle of a product.

### Implementation:
- **Location**: `client/src/pages/aggregator/ReportsTraceability.jsx`
- **Logic**:
  1. Search by UID.
  2. Backend fetches **Supabase History** (Detailed locations, notes).
  3. Backend fetches **Blockchain Status** (Current immutable state).
  4. Frontend merges both into a "Certified Journey".

---

## 💰 6. Secure Settlement (Escrow)

Payments are secured via smart contracts. Funds are held until the retailer confirms receipt or quality is verified.

### Implementation:
- **Contract**: `OrderEscrow.sol`
- **Frontend**: `processEscrowPayment` in `Web3Context.js`.
- **Backend**: `releaseEscrow` in `config/blockchain.js`.

---

## 🚀 7. Troubleshooting & Verification

1. **Verify Contracts**: Check `server/blockchain/contract-addresses.json` for current deployments.
2. **Local Node**: Ensure Hardhat node is running (`npx hardhat node`).
3. **Wallet Connection**: Use the "Verify Identity" button in the Profile page to link your MetaMask.

**CropChain Blockchain v2.0.0**
*Securing the future of agriculture, block by block.*
