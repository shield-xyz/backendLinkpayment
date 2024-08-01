const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

const merchantRoutes = require('./routes/merchantRoutes');
const authRoutes = require('./routes/authRoutes'); // Importar rutas de autenticación
const linkPaymentRoutes = require('./routes/linkPaymentRoutes'); // Importar rutas de linkPayment
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
const walletNetworkUserRoutes = require('./routes/walletNetworkUser.route');
const configurationsRoutes = require("./routes/configuration.route");
const notificationsUserRoutes = require('./routes/NotificationsUser.route');
const bankRoutes = require("./routes/bank.route")
const RampableRoutes = require("./routes/rampable.route")
const VolumeTransactionsRoute = require("./routes/volumeTransaction.route");
const transactionBuySell = require("./routes/transactionBuySell.route");
const initializeSocket = require('./routes/socket.route');
const { connectDB } = require('./db');

const app = express();
const server = http.createServer(app);

// Inicializar Socket.IO y agregar rutas de notificación
const useSocketRoutes = initializeSocket(server);
useSocketRoutes(app);

// Middlewares
app.use(cors()); // Permite todas las solicitudes CORS
app.use(bodyParser.json());

// Rutas
app.use('/api/merchants', merchantRoutes);
app.use('/api/auth', authRoutes); // Usar rutas de autenticación
app.use('/api/linkPayments', linkPaymentRoutes); // Usar rutas de linkPayment
app.use('/api/balances', balanceRoutes);
app.use('/api/users', userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/networks", networksRoutes);
app.use("/api/payments", paymentsRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/slack', slackRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/notifications', notificationsUserRoutes);
app.use('/api/withdraws', withdrawRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/walletsUser', walletNetworkUserRoutes);
app.use('/api/configurations', configurationsRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/rampable', RampableRoutes);
app.use('/api/volumetransactions', VolumeTransactionsRoute);
app.use('/api/buysell', transactionBuySell);


app.get('/health-check', (req, res) => res.status(200).send('OK'));

// Configurar la carpeta de archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB
connectDB().then(() => {
    // Iniciar el servidor después de que la base de datos se haya conectado
    const PORT = process.env.PORT || 9000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});
