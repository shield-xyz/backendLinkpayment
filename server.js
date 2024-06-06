// server.js
const express = require('express');
const bodyParser = require('body-parser');
// const connectDB = require('./db');
require('dotenv').config();
const transactionRoutes = require('./routes/transactionRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const authRoutes = require('./routes/authRoutes'); // Importar rutas de autenticación
const linkPaymentRoutes = require('./routes/linkPaymentRoutes'); // Importar rutas de linkPayment

const balanceRoutes = require('./routes/balance.route');
const blockchainRoutes = require('./routes/blockchain.route');
const cardRoutes = require('./routes/cards.route');
const limitsRoutes = require('./routes/limits.route');
const transactionsRoutes = require('./routes/transactions.route');
const txHash = require('./routes/txHash.route');
const txOrphanedRoutes = require('./routes/txOrphaned.route');
const userRoutes = require('./routes/user.route');
const walletRoutes = require('./routes/wallet.route');
const webhookRoutes = require('./routes/webhook.route');

const cors = require('cors');
const { connectDB } = require('./db');
const app = express();
// Conectar a la base de datos
connectDB();

// Middleware
app.use(cors()); // Permite todas las solicitudes CORS
app.use(bodyParser.json());

// Rutas
app.use('/api/transactions', transactionRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/auth', authRoutes); // Usar rutas de autenticación
app.use('/api/linkPayments', linkPaymentRoutes); // Usar rutas de linkPayment

app.use('/api/balances', balanceRoutes);
app.use('/api/blockchains', blockchainRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/limits', limitsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/tx-hash', txHash);
app.use('/api/tx-orphaned', txOrphanedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/webhook', webhookRoutes);
app.get('/health-check', (req, res) => res.status(200).send('OK'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
