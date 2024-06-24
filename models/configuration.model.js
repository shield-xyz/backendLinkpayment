const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    json: { type: mongoose.Schema.Types.Mixed },
    value: { type: String },
    options: [{
        value: { type: String },
        name: { type: String }
    }]
}, { timestamps: true });

const Configuration = mongoose.model('Configuration', configurationSchema);

module.exports = Configuration;
