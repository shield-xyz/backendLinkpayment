// server.js
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();
const transactionRoutes = require('./routes/transactionRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const authRoutes = require('./routes/authRoutes'); // Importar rutas de autenticación
const linkPaymentRoutes = require('./routes/linkPaymentRoutes'); // Importar rutas de linkPayment
const path = require('path');
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
const assetRoutes = require('./routes/assets.route');
const networksRoutes = require('./routes/networks.route');
const paymentsRoutes = require('./routes/payments.route');
const clientRoutes = require('./routes/clients.route');
const withdrawRoutes = require('./routes/withdraw.route');
const accountRoutes = require('./routes/account.route');
const slackRoutes = require('./routes/slack.route');

const cors = require('cors');
const { connectDB } = require('./db');
const { listChannelsAndJoinIfNotMember, fetchMessages } = require('./controllers/SlackController');
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
// app.use('/api/cards', cardRoutes);
// app.use('/api/limits', limitsRoutes);
// app.use('/api/transactions', transactionsRoutes);
// app.use('/api/tx-hash', txHash);
// app.use('/api/tx-orphaned', txOrphanedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);

app.use("/api/assets", assetRoutes)
app.use("/api/networks", networksRoutes)
app.use("/api/payments", paymentsRoutes)
app.use('/api/clients', clientRoutes);
app.use('/api/slack', slackRoutes);


// Tus otras configuraciones de middlewares y rutas
app.use('/api/withdraws', withdrawRoutes);
app.use('/api/accounts', accountRoutes);

app.use('/api/webhook', webhookRoutes);
app.get('/health-check', (req, res) => res.status(200).send('OK'));

// Configurar la carpeta de archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// listChannelsAndJoinIfNotMember();

// try {
//     fetchMessages()
//     setInterval(fetchMessages, 300000); // 300000 ms = 5 minutos

// } catch (error) {
//     console.log(error, "error en parte de slack ")
// }




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
