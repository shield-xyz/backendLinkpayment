const mongoose = require('mongoose');

const NetworkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // trim: true,
    },
    logo: {
        type: String,
        trim: true,
    },
    deposit_address: {
        type: String,
        trim: true,
    },
    networkId: {
        type: String,
        required: true,
        unique: true,
    },
});
NetworkSchema.virtual('assets', {
    ref: 'Asset', // The model to use
    localField: 'networkId', // Find people where `localField`
    foreignField: 'networkId', // is equal to `foreignField`
    match: { active: true } // Filtro para los documentos relacionados
});
NetworkSchema.set('toObject', { virtuals: true });
module.exports = mongoose.model('Network', NetworkSchema);
