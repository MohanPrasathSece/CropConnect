const axios = require('axios');

async function testServer() {
    try {
        console.log('Testing server connection...');
        
        // Test health endpoint
        const healthResponse = await axios.get('http://localhost:5001/health');
        console.log('✅ Health check:', healthResponse.data);
        
        // Test farmer crops endpoint
        const cropsResponse = await axios.get('http://localhost:5001/api/v1/farmer/crops/test@example.com');
        console.log('✅ Farmer crops endpoint working');
        
        console.log('🎉 All tests passed! Server is running correctly.');
    } catch (error) {
        console.error('❌ Server test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the server is running on port 5001');
        }
    }
}

testServer();
