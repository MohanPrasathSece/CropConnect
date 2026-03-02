const QRCode = require('qrcode');

/**
 * Generate a QR code that points to the public traceability page
 * @param {string} traceabilityId - The unique ID of the crop or batch
 * @returns {Promise<string>} - Base64 data URL of the QR code
 */
const generateTraceabilityQR = async (traceabilityId) => {
    try {
        // In development, we use localhost. In production, this would be the real domain.
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const traceUrl = `${baseUrl}/trace/${traceabilityId}`;

        console.log(`🔗 Generating QR for URL: ${traceUrl}`);

        return await QRCode.toDataURL(traceUrl, {
            errorCorrectionLevel: 'H',
            margin: 2,
            color: {
                dark: '#0f172a', // slate-900
                light: '#ffffff'
            }
        });
    } catch (err) {
        console.error('QR Generation Error:', err);
        throw err;
    }
};

module.exports = { generateTraceabilityQR };
