const mongoose = require('mongoose');

const configurationUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    configurationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Configuration', required: true },
    value: { type: String },
    json: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

configurationUserSchema.virtual('user', {
    ref: 'User', // The model to use
    localField: 'userId', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`,
    justOne: true
});
configurationUserSchema.virtual('configuration', {
    ref: 'Configuration', // The model to use
    localField: 'configurationId', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`,
    justOne: true
});
configurationUserSchema.set('toObject', { virtuals: true });

const ConfigurationUser = mongoose.model('ConfigurationUser', configurationUserSchema);

module.exports = ConfigurationUser;
