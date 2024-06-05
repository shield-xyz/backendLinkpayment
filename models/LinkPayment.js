// models/LinkPayment.js
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const LinkPaymentSchema = new mongoose.Schema({
    merchantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true,
    },
    id: {
        type: String,
        unique: true,
        trim: true,
        // required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    token: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        trim: true,
        default: "pending"
    },
    hash: {
        type: Array,
        default: []
    },
    walletsTriedPayment: {
        type: Array,
        default: []
    },
});

LinkPaymentSchema.pre('save', function (next) {
    // Generar un ID único para el link

    if (this.id == null) {
        const crypto = require('crypto');
        const linkId = crypto.randomBytes(16); // Generar un ID único para el enlace
        // Generar una clave aleatoria de 32 bytes (256 bits)
        const secretKey = crypto.randomBytes(32);

        // Crear un vector de inicialización (IV)
        const iv = crypto.randomBytes(16); // 16 bytes para AES

        // Crear un objeto de cifrado usando AES
        const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

        // Encriptar el ID del enlace
        let encryptedId = cipher.update(linkId, 'utf8', 'hex');
        encryptedId += cipher.final('hex');

        // Almacenar el ID encriptado en el modelo
        this.id = encryptedId;
    }
    next();
});

module.exports = mongoose.model('LinkPayment', LinkPaymentSchema);
