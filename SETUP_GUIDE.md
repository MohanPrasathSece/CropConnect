# 🚀 CropChain - Quick Setup Guide

## Prerequisites Checklist
- [ ] Node.js 16+ installed
- [ ] npm or yarn installed
- [ ] MetaMask browser extension
- [ ] Supabase account created
- [ ] Google Gemini API key obtained

---

## Step-by-Step Setup

### 1. Get Google Gemini API Key (5 minutes)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Click **"Create API key in new project"**
5. Copy the generated API key
6. Save it securely - you'll need it for the `.env` file

**Note**: The free tier includes:
- 60 requests per minute
- 1,500 requests per day
- Perfect for development and testing

---

### 2. Setup Supabase (10 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Create a new organization and project
4. Wait for database to provision (2-3 minutes)
5. Go to **Settings → API**
6. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (for server)

---

### 3. Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd cropchain

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### 4. Configure Environment Variables

#### Server Configuration

Create `server/.env`:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Supabase (from Step 2)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Google Gemini AI (from Step 1)
GEMINI_API_KEY=your_gemini_api_key_here

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Client Configuration

Create `client/.env`:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5000/api/v1
```

---

### 5. Setup Supabase Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Create the following tables:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('farmer', 'aggregator', 'retailer', 'consumer')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crops table
CREATE TABLE crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  variety TEXT,
  category TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT DEFAULT 'kg',
  price_per_unit DECIMAL,
  status TEXT DEFAULT 'listed',
  images JSONB,
  blockchain_hash TEXT,
  traceability_id TEXT,
  harvest_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view listed crops" ON crops
  FOR SELECT USING (status = 'listed');

CREATE POLICY "Farmers can insert own crops" ON crops
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);
```

3. Go to **Storage** → Create bucket named `crop-images`
4. Set bucket to **Public**

---

### 6. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

You should see:
```
🚀 CropChain Server running on port 5000
📊 Supabase Connected and Verified
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Browser should open to `http://localhost:3000`

---

### 7. Test the Application

#### Test Google Translate:
1. Click the language icon (🌐) in the header
2. Select a language (e.g., Hindi)
3. Page should translate

#### Test Registration:
1. Click **"Get Started"**
2. Fill in the form
3. Select role: **Farmer**
4. Submit

#### Test AI Quality Grading:
1. Login as Aggregator
2. Navigate to QR Scanner
3. Upload crop images
4. AI should analyze and provide quality report

---

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not found"
**Solution**: 
- Check `server/.env` file exists
- Verify API key is correct
- Restart server after adding key

### Issue: "Supabase connection failed"
**Solution**:
- Verify Supabase URL and keys in `.env`
- Check if Supabase project is active
- Ensure tables are created

### Issue: Google Translate not working
**Solution**:
- Check internet connection
- Clear browser cache
- Verify script loaded in browser console

### Issue: Port 5000 already in use
**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Server running on port 5000
- [ ] Client running on port 3000
- [ ] Can register new user
- [ ] Can login
- [ ] Google Translate button appears
- [ ] Translation works
- [ ] Can upload crop (farmer)
- [ ] AI quality grading works (aggregator)
- [ ] Analytics dashboard shows data

---

## 📞 Need Help?

- Check `IMPLEMENTATION_SUMMARY.md` for detailed feature docs
- Review `README.md` for API documentation
- Check server logs for error messages
- Verify all environment variables are set

---

## 🎉 You're Ready!

Your CropChain platform is now running locally. Start exploring:

1. **Farmer Flow**: Register → Upload Crop → View Analytics
2. **Aggregator Flow**: Scan QR → Quality Check → Collect
3. **Consumer Flow**: Browse Marketplace → Trace Product

---

**Happy Farming! 🌾**
