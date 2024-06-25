const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';
const MONGOURI = process.env.MONGO_URL || 'mongodb://localhost:27017';




const CONFIGURATIONS = {
  EMAIL_NAME: "email notifications"
};
const NOTIFICATIONS = {
  NEW_TRANSACTION: (quote_amount, symbol, name) => { return { title: "Payment Received", description: "You have received a payment of " + `${quote_amount} ${symbol} - ${name}` } },
  NEW_WITHDRAW: (amount, withdrawId) => { return { title: `Withdraw created", description: "We are processing your withdrawal of ${amount}. Withdrawal ID: ${withdrawId} ` } }
}

module.exports = {
  JWT_SECRET,
  MONGOURI, CONFIGURATIONS,
  NOTIFICATIONS,
};
