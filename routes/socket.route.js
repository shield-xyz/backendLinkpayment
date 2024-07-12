const logger = require('node-color-log');
const socketIo = require('socket.io');

const initializeSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: [process.env.URL_FRONT, "http://localhost:3000"], // URL del frontend
            methods: ["GET", "POST"]
        }
    });

    // Almacenar la instancia de io globalmente para que pueda ser utilizada en otros archivos
    global.io = io;

    // Manejar conexiones de WebSocket
    io.on('connection', (socket) => {
        console.log('a user connected:', socket.id);
        try {
            // Recibir userId y unirse a la sala
            socket.on('join', (userId) => {
                socket.join(userId);
                console.log(`User ${userId} joined room ${userId}`);
            });

            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        } catch (error) {
            console.log(error)
            logger.fontColorLog("orange", "error in socket connection")
        }

    });

    // Rutas de API para notificaciones
    return (app) => {
        app.post('/notify', (req, res) => {
            try {
                const { message, userId } = req.body;
                io.to(userId).emit('notification', message);
                res.status(200).send('Notification sent');

            } catch (error) {
                logger.error(error);
                logger.fontColorLog("orange", "error in notify socket")
            }
        });
    };
};

module.exports = initializeSocket;
