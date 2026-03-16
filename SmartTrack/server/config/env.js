require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/smarttrack',
  JWT_SECRET:  process.env.JWT_SECRET  || 'smarttrack_dev_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  PORT:        process.env.PORT        || 3000,
};
