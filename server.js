// server.js
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();
const merchantRoutes = require('./routes/merchantRoutes');
const authRoutes = require('./routes/authRoutes'); // Importar rutas de autenticación
const linkPaymentRoutes = require('./routes/linkPaymentRoutes'); // Importar rutas de linkPayment
const path = require('path');
const balanceRoutes = require('./routes/balance.route');
const transactionsRoutes = require('./routes/transactions.route');
const userRoutes = require('./routes/user.route');
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
const EthereumNetworkUtils = require('./utils/EthereumNetworkUtils');
const app = express();
// Conectar a la base de datos
connectDB();

// Middleware
app.use(cors()); // Permite todas las solicitudes CORS
app.use(bodyParser.json());

// Rutas
app.use('/api/merchants', merchantRoutes);
app.use('/api/auth', authRoutes); // Usar rutas de autenticación
app.use('/api/linkPayments', linkPaymentRoutes); // Usar rutas de linkPayment

app.use('/api/balances', balanceRoutes);
app.use('/api/users', userRoutes);

app.use("/api/assets", assetRoutes)
app.use("/api/networks", networksRoutes)
app.use("/api/payments", paymentsRoutes)
app.use('/api/clients', clientRoutes);
app.use('/api/slack', slackRoutes);
app.use('/api/transactions', transactionsRoutes);



// Tus otras configuraciones de middlewares y rutas
app.use('/api/withdraws', withdrawRoutes);
app.use('/api/accounts', accountRoutes);

app.get('/health-check', (req, res) => res.status(200).send('OK'));

// Configurar la carpeta de archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/', (req, res) => res.status(200).send('Api Shield 1.0'));


// EthereumNetworkUtils.getTransactionDetails("0xc933b043360b9e9da4066cd06751c07633d7fff660e02a0a8db75200423d2340").then(res => {
//     console.log(res, "balance")
// })


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
