const dotenv = require('dotenv');

dotenv.config();

const CRYPT_API_KEY = process.env.CRYPT_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || '';
const MONGOURI = process.env.MONGO_URL || 'mongodb://localhost:27017';
const PORT = process.env.PORT || 8080;



const CONFIGURATIONS = {
  EMAIL_NAME: "email notifications"
};

module.exports = {
  CRYPT_API_KEY,
  JWT_SECRET,
  MONGOURI, CONFIGURATIONS,
  PORT,
};
