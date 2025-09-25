# 🌾 AgriChain - Decentralized Agricultural Supply Chain Platform

A production-ready full-stack web application that leverages blockchain technology to create transparency and trust in agricultural supply chains.

## 🚀 Tech Stack

- **Frontend**: React.js + TailwindCSS + shadcn/ui
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM
- **Blockchain**: Ethereum-compatible (Solidity + Hardhat)
- **Web3 Integration**: Ethers.js
- **Authentication**: JWT with role-based access control
- **AI**: TensorFlow.js for crop classification
- **QR Code**: Traceability system

## 👥 User Roles

- **Farmer**: Upload crop details, manage harvests
- **Aggregator**: Manage logistics, verify uploads
- **Retailer/Consumer**: Scan QR codes for traceability
- **Admin**: Oversee transactions, handle disputes

## 🔑 Key Features

1. **Farmer-Friendly Crop Upload**: Mobile-responsive forms with AI-powered crop detection
2. **Blockchain Produce Ledger**: Immutable records on Ethereum
3. **Smart Payment System**: Automated escrow payments
4. **Logistics Management**: Transparent transport tracking
5. **QR Code Traceability**: Complete supply chain visibility
6. **Compliance Certificates**: Auto-generated digital certificates

## 📂 Project Structure

```
agri-chain/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Role-specific dashboards
│   │   ├── utils/         # Web3, AI, QR utilities
│   │   └── hooks/         # Custom React hooks
├── server/                # Node.js backend
│   ├── controllers/       # Business logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth & validation
│   └── utils/            # Helper functions
├── blockchain/           # Smart contracts
│   ├── contracts/        # Solidity contracts
│   ├── scripts/          # Deployment scripts
│   └── test/            # Contract tests
└── docs/                # Documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB
- MetaMask wallet
- Git

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd agri-chain
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Install blockchain dependencies
cd ../blockchain && npm install
```

3. **Environment Setup**
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
cp blockchain/.env.example blockchain/.env
```

4. **Start MongoDB**
```bash
mongod
```

5. **Deploy Smart Contracts (Local)**
```bash
cd blockchain
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

6. **Start the application**
```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm start
```

## 🔗 Smart Contracts

- **ProduceLedger.sol**: Manages crop records and traceability
- **PaymentManager.sol**: Handles escrow payments and releases

## 📊 Database Schema

- Users (Farmers, Aggregators, Retailers, Admins)
- Crops (Harvest records, quality grades)
- Transactions (Payment history)
- Logistics (Transport details)

## 🧪 Testing

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Smart contract tests
cd blockchain && npx hardhat test
```

## 🚀 Deployment

### Testnet Deployment
1. Configure testnet in `blockchain/hardhat.config.js`
2. Deploy contracts: `npx hardhat run scripts/deploy.js --network sepolia`
3. Update contract addresses in frontend

### Production Deployment
- Frontend: Vercel/Netlify
- Backend: AWS/Heroku
- Database: MongoDB Atlas
- Blockchain: Ethereum Mainnet

## 📈 Features Roadmap

- [x] Basic CRUD operations
- [x] JWT Authentication
- [x] Smart contract integration
- [x] QR code generation
- [x] AI crop classification
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@agrichain.com or join our Discord community.
