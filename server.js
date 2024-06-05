// server.js
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db');
require('dotenv').config();
const transactionRoutes = require('./routes/transactionRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const authRoutes = require('./routes/authRoutes'); // Importar rutas de autenticación
const linkPaymentRoutes = require('./routes/linkPaymentRoutes'); // Importar rutas de linkPayment

const cors = require('cors');
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
