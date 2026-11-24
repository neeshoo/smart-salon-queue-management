const QRCode = require('qrcode');

const generateSalonQRCode = async (salonId) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const joinQueueUrl = `${clientUrl}/salons/${salonId}/join`;

  try {
    const qrDataUrl = await QRCode.toDataURL(joinQueueUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      scale: 8,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error('[QRCode Error]', err);
    return null;
  }
};

module.exports = { generateSalonQRCode };
