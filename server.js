const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const merchantRoutes = require("./routes/merchantRoutes");
const authRoutes = require("./routes/authRoutes"); // Importar rutas de autenticación
const linkPaymentRoutes = require("./routes/linkPaymentRoutes"); // Importar rutas de linkPayment
const balanceRoutes = require("./routes/balance.route");
const transactionsRoutes = require("./routes/transactions.route");
const userRoutes = require("./routes/user.route");
const assetRoutes = require("./routes/assets.route");
const networksRoutes = require("./routes/networks.route");
const paymentsRoutes = require("./routes/payments.route");
const clientRoutes = require("./routes/clients.route");
const withdrawRoutes = require("./routes/withdraw.route");
const accountRoutes = require("./routes/account.route");
const slackRoutes = require("./routes/slack.route");
const walletNetworkUserRoutes = require("./routes/walletNetworkUser.route");
const configurationsRoutes = require("./routes/configuration.route");
const notificationsUserRoutes = require("./routes/NotificationsUser.route");

const initializeSocket = require("./routes/socket.route");
const { connectDB } = require("./db");
const { calculateUptime } = require("./utils/systemPerformanceMetrics");

const app = express();
const server = http.createServer(app);

// Inicializar Socket.IO y agregar rutas de notificación
const useSocketRoutes = initializeSocket(server);
useSocketRoutes(app);

// Middlewares
app.use(cors()); // Permite todas las solicitudes CORS
app.use(bodyParser.json());

// Rutas
app.use("/api/merchants", merchantRoutes);
app.use("/api/auth", authRoutes); // Usar rutas de autenticación
app.use("/api/linkPayments", linkPaymentRoutes); // Usar rutas de linkPayment
app.use("/api/balances", balanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/networks", networksRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/slack", slackRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/notifications", notificationsUserRoutes);
app.use("/api/withdraws", withdrawRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/walletsUser", walletNetworkUserRoutes);
app.use("/api/configurations", configurationsRoutes);

app.get("/health-check", (req, res) => res.status(200).send("OK"));

// Configurar la carpeta de archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Conexión a MongoDB
connectDB()
  .then(() => {
    // Iniciar el servidor después de que la base de datos se haya conectado
    const PORT = process.env.PORT || 9000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Run the function to calculate uptime and downtime
calculateUptime();

let totalRequests = 0;
let errorCount = 0;

app.use((req, res, next) => {
  totalRequests++;
  next();
});

app.get("/api", (req, res) => {
  // Simulate an error
  const isError = Math.random() > 0.8;
  if (isError) {
    errorCount++;
    res.status(500).json({ error: "Internal server error" });
  } else {
    res.status(200).json({ message: "Success" });
  }
});

// Function to calculate error rate
function calculateErrorRate() {
  const errorRate = (errorCount / totalRequests) * 100;
  logger.info(`Error Rate: ${errorRate.toFixed(2)}%`);
}

// Calculate error rate every minute
setInterval(calculateErrorRate, 60000);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`Request to ${req.path} took ${duration}ms`);
  });
  next();
});

// Formula template to calculate Time spent on different sections of the app.

// app.post('/enter-section', async (req, res) => {
//     const { userId, section } = req.body;
//     await logSectionEvent(userId, section, 'enter');
//     logger.info('User entered section', { userId, section, event: 'enter', timestamp: new Date() });
//     res.status(200).send('Entered section');
// });

// // Endpoint to log exit from a section
// app.post('/exit-section', async (req, res) => {
//     const { userId, section } = req.body;
//     await logSectionEvent(userId, section, 'exit');
//     logger.info('User exited section', { userId, section, event: 'exit', timestamp: new Date() });
//     res.status(200).send('Exited section');
// });
