# 🚀 AgriChain Deployment Guide

This guide will help you deploy the AgriChain platform locally and in production.

## 📋 Prerequisites

- Node.js (v18+)
- MongoDB (v5+)
- MetaMask wallet
- Git

## 🏠 Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd agri-chain

# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 2. Environment Configuration

Copy environment files and configure:

```bash
# Server environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secrets, etc.

# Client environment
cp client/.env.example client/.env
# Edit client/.env with API URLs

# Blockchain environment
cp blockchain/.env.example blockchain/.env
# Edit blockchain/.env with your private key and RPC URLs
```

### 3. Database Setup

Start MongoDB:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. Blockchain Setup

Deploy smart contracts locally:
```bash
cd blockchain

# Start local Hardhat node
npx hardhat node

# In another terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 5. Start Development Servers

```bash
# Start all services (from root directory)
npm run dev

# Or start individually:
npm run server    # Backend on port 5000
npm run client    # Frontend on port 3000
npm run blockchain # Hardhat node on port 8545
```

## 🌐 Production Deployment

### Backend Deployment (Heroku/AWS)

1. **Heroku Deployment:**
```bash
cd server
heroku create agrichain-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your-mongodb-atlas-uri>
heroku config:set JWT_SECRET=<your-jwt-secret>
git push heroku main
```

2. **AWS EC2 Deployment:**
```bash
# Install PM2 for process management
npm install -g pm2

# Start server with PM2
cd server
pm2 start server.js --name "agrichain-api"
pm2 startup
pm2 save
```

### Frontend Deployment (Vercel/Netlify)

1. **Vercel Deployment:**
```bash
cd client
npm install -g vercel
vercel --prod
```

2. **Netlify Deployment:**
```bash
cd client
npm run build
# Upload dist folder to Netlify or connect GitHub repo
```

### Smart Contract Deployment

1. **Testnet Deployment (Sepolia):**
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
```

2. **Mainnet Deployment:**
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network mainnet
```

### Database (MongoDB Atlas)

1. Create MongoDB Atlas cluster
2. Configure network access and database user
3. Update connection string in environment variables

## 🔧 Configuration

### Environment Variables

**Server (.env):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/agrichain
JWT_SECRET=your-super-secret-jwt-key
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/your-key
PRODUCE_LEDGER_ADDRESS=0x...
PAYMENT_MANAGER_ADDRESS=0x...
```

**Client (.env):**
```env
REACT_APP_API_URL=https://your-api-domain.com/api/v1
REACT_APP_BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/your-key
REACT_APP_PRODUCE_LEDGER_ADDRESS=0x...
REACT_APP_PAYMENT_MANAGER_ADDRESS=0x...
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Smart contract tests
cd blockchain && npx hardhat test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Wallet connection (MetaMask)
- [ ] Crop upload with image
- [ ] Blockchain transaction recording
- [ ] QR code generation and scanning
- [ ] Payment flow simulation
- [ ] Role-based access control

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- Database: Monitor MongoDB Atlas metrics
- Blockchain: Check transaction confirmations

### Logging
- Server logs: PM2 logs or Heroku logs
- Client errors: Browser console
- Smart contract events: Etherscan

## 🔒 Security

### Production Security Checklist
- [ ] Use HTTPS for all endpoints
- [ ] Secure JWT secrets
- [ ] Enable CORS properly
- [ ] Use environment variables for sensitive data
- [ ] Regular security updates
- [ ] Smart contract audits

## 🚨 Troubleshooting

### Common Issues

1. **MetaMask Connection Issues:**
   - Ensure correct network (localhost/testnet)
   - Check contract addresses
   - Clear browser cache

2. **Database Connection:**
   - Verify MongoDB URI
   - Check network access rules
   - Ensure database user permissions

3. **Smart Contract Deployment:**
   - Sufficient ETH for gas fees
   - Correct network configuration
   - Valid private key

### Support
- Check logs for error messages
- Verify environment variables
- Test API endpoints individually
- Use blockchain explorers for transaction debugging

## 📈 Scaling

### Performance Optimization
- Use CDN for static assets
- Implement caching (Redis)
- Database indexing
- Load balancing
- Container orchestration (Docker/Kubernetes)

### Monitoring Tools
- Application: New Relic, DataDog
- Infrastructure: AWS CloudWatch, Heroku Metrics
- Blockchain: Alchemy, Infura analytics

---

For additional support, please refer to the main README.md or contact the development team.
