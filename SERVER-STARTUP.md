# AgriTrack Backend Server Startup Guide

## Quick Start
1. **Install dependencies** (if not already done):
   ```bash
   cd "d:\FST Projects\AgriTrack\server"
   npm install
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```
   OR simply double-click: `start-server.bat`

3. **Verify it's working**:
   ```bash
   node test-server.js
   ```

## What I Fixed
- ✅ Fixed StatusBadge import error in FarmerDashboard.jsx
- ✅ Added better error handling to farmer crops and delete endpoints  
- ✅ Fixed port mismatch (server now runs on 5001 to match frontend proxy)
- ✅ Enhanced logging for debugging

## Expected Server Output
When running correctly, you should see:
```
🚀 CropChain Server running on port 5001
🌍 Environment: development
📡 API Version: v1
🔗 Health Check: http://localhost:5001/health
📊 Supabase Connected and Verified
```

## Troubleshooting
- **Connection Refused**: Server isn't running - start it with `npm run dev`
- **Port 5001 in use**: Change PORT in .env or kill existing process
- **Supabase errors**: Check .env file has correct SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

## Test the Fix
Once server is running, the frontend should:
- Load farmer crops without errors
- Allow deleting crops successfully
- Show proper error messages instead of 500 errors
