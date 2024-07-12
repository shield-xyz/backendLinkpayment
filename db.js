const mongoose = require('mongoose');
const logger = require('node-color-log');
const NotificationsUserModel = require('./models/NotificationsUser.model');
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
        changeStream.on('change', (change) => {
            // console.log(change, "change watchNotifications")
            if (change.operationType === 'insert') {
                const notification = change.fullDocument;
                console.log('New notification inserted:', notification);
                // Aquí puedes emitir un evento a través de Socket.IO u otro mecanismo
                if (global.io) {
                    global.io.emit('notification', notification);
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
