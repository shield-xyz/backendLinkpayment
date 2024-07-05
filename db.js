const mongoose = require('mongoose');
const logger = require('node-color-log');
const NotificationsUserModel = require('./models/NotificationsUser.model');
const { getNotifications } = require('./controllers/NotificationsUser.controller');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: process.env.DB_NAME_MONGO
        });
        console.log('MongoDB connected...');

        // Llamar a la función para observar eventos de MongoDB
        watchNotifications();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

let response = (data, status = "success") => {
    return { response: data, status: status }
};

// Función para observar la colección de notificaciones
const watchNotifications = () => {

    try {
        const NotificationsUser = NotificationsUserModel;
        const changeStream = NotificationsUser.watch();
        changeStream.on('change', async (change) => {
            // console.log(change, "change watchNotifications")
            if (change.operationType === 'insert') {
                const notification = change.fullDocument;
                logger.info('New notification inserted: user ->', notification.userId);
                // Aquí puedes emitir un evento a través de Socket.IO u otro mecanismo
                if (global.io) {
                    let notifi = await getNotifications({ userId: notification.userId, status: { $nin: ["deleted"] } })
                    global.io.emit('notification', notifi);
                }
            }
        });

        changeStream.on('error', (error) => {
            console.error('Error in change stream:', error);
        });
    } catch (error) {
        console.log(error)
        logger.fontColorLog("orange", "error in watchNotifications")
    }

};

module.exports = { connectDB, response };
