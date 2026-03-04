# Real-Time Pricing Implementation Guide

## Overview
This guide shows how to replace simulated pricing data with real-time market data in AgriTrack.

## 🚀 Quick Setup

### 1. Install Required Dependencies
```bash
# Backend Python dependencies
cd server
pip install requests pandas numpy scikit-learn joblib

# Node.js dependencies (already installed)
npm install
```

### 2. Configure API Keys
Create/update `.env` file in server directory:
```env
# Weather API (OpenWeatherMap)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Agricultural Market API
AGRI_MARKET_API_KEY=your_agrimarket_api_key_here

# Existing Supabase config
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
```

### 3. Get API Keys

#### OpenWeatherMap API (Free)
1. Visit https://openweathermap.org/api
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env` file

#### Alternative Market Data Sources
- **AgriMarket** (India): https://api.data.gov.in/catalog/api-category
- **WeatherAPI**: https://www.weatherapi.com/
- **Mock APIs** for testing: Use built-in fallback data

## 📊 How It Works

### Data Sources
1. **Weather Data**: Temperature, humidity, rainfall affecting crop prices
2. **Market Prices**: Real-time commodity prices from government markets
3. **Historical Data**: Past price trends for pattern recognition
4. **Seasonal Factors**: Month-based price variations

### Features
- **Real-time Updates**: Every 5 minutes auto-refresh
- **Weather Impact**: Shows how weather affects pricing
- **Seasonal Trends**: Considers harvest seasons
- **Price Predictions**: ML-powered forecasting
- **Fallback System**: Works even when APIs are down

## 🔧 Integration Points

### Backend APIs Created
```
GET /api/v1/pricing/real-time/:crop?location=Tamil Nadu
GET /api/v1/pricing/market-data?location=Tamil Nadu  
GET /api/v1/pricing/historical/:crop?days=30
POST /api/v1/pricing/train-model
```

### Frontend Components
- `RealTimePricing.jsx` - Display live pricing widget
- `pricingApi` - API utility functions
- Auto-refresh every 5 minutes
- Weather impact visualization

## 🎯 Usage Examples

### In Crop Upload Form
```jsx
import RealTimePricing from '../../components/farmer/RealTimePricing';

<RealTimePricing crop="Tomato" location="Tamil Nadu" />
```

### In Farmer Dashboard
```jsx
import { pricingApi } from '../../utils/api';

const fetchMarketData = async () => {
  const data = await pricingApi.getMarketData('Tamil Nadu');
  console.log('Current market prices:', data);
};
```

## 🔄 Data Flow

1. **Data Collection**: Python script fetches real-time data
2. **Processing**: Weather + market data combined
3. **ML Training**: Model learns seasonal patterns
4. **Prediction**: Real-time price forecasting
5. **API Delivery**: JSON responses to frontend
6. **UI Display**: Live pricing widgets with updates

## 🛠️ Configuration Options

### Update Frequency
- Default: 5 minutes
- Configurable in `RealTimePricing.jsx`
- Reduce for testing, increase for production

### Location Support
- Default: Tamil Nadu, India
- Add more locations in Python script
- Supports GPS coordinates

### Crop Types
- Currently: Tomato, Onion, Potato
- Easy to add more crops
- Update base prices in Python script

## 📈 Monitoring & Analytics

### Track Performance
```javascript
// Monitor API response times
const startTime = Date.now();
const response = await pricingApi.getRealTimePrice('Tomato');
const responseTime = Date.now() - startTime;
```

### Data Quality
- Confidence levels (high/medium/low)
- Source attribution
- Fallback when APIs fail

## 🚨 Troubleshooting

### Common Issues
1. **API Keys Invalid**: Check `.env` file
2. **Python Script Fails**: Install missing dependencies
3. **No Real-time Data**: Falls back to simulated data
4. **Slow Loading**: Check network connectivity

### Debug Mode
```javascript
// Enable console logging
console.log('Pricing data:', pricingData);
```

## 🔮 Future Enhancements

### Planned Features
- **More Data Sources**: Commodity exchanges, international markets
- **Advanced ML**: LSTM networks for time-series prediction
- **Mobile Push**: Price alerts for farmers
- **Blockchain**: Transparent price history
- **Multi-location**: Regional price comparisons

### Data Sources to Add
- NAM India (National Agriculture Market)
- e-NAM API integration
- Weather department APIs
- Satellite data for crop health

## 📞 Support

For issues:
1. Check server logs for Python script errors
2. Verify API keys are correct
3. Test with fallback data first
4. Check network connectivity

## 🎉 Success Metrics

- **Response Time**: < 2 seconds for price data
- **Accuracy**: > 85% prediction accuracy
- **Uptime**: 99.5% availability
- **Coverage**: Major agricultural regions

This system transforms your simulated pricing into a real-time, data-driven solution that provides actual market insights to farmers!
