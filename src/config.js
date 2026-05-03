module.exports = {
  PORT: process.env.PORT || 3000,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'noorx2024',
  SESSION_SECRET: process.env.SESSION_SECRET || 'noorx_secret_key_2024',
  WHATSAPP_CHANNEL_ID: process.env.WHATSAPP_CHANNEL_ID || 'https://whatsapp.com/channel/0029Vb7vchCCBtxK3Ria2k1i',
  CHANNEL_CHECK_INTERVAL: 10 * 60 * 60 * 1000, // 10 hours in milliseconds
  PAIRING_TIMEOUT: 2 * 60 * 1000, // 2 minutes
  PAIRING_CODE_TIMEOUT: 5 * 60 * 1000, // 5 minutes for code validity
  NODE_ENV: process.env.NODE_ENV || 'production',
};

