const mongoose = require('mongoose');
const { Schema } = mongoose;

// Definir el esquema para NotificationHistory
const NotificationHistorySchema = new Schema({
    userId: {
        type: String,
        ref: 'User',
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
       
        default: 'info'
    },
    error:{},
    lineCode: {
        type: String
    },
    from: {
        type: String
    },
    to: {
        type: String
    },
    status: {
        type: String,
        enum: ['sent', 'failed', 'pending'],
        default: 'sent'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Crear un middleware para actualizar la fecha de actualización (updatedAt)
NotificationHistorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Crear el modelo NotificationHistory basado en el esquema
const NotificationHistoryModel = mongoose.model('NotificationHistory', NotificationHistorySchema);

module.exports = NotificationHistoryModel;
