const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rampableWebhookSchema = new Schema({
    body: { type: Object }
});

const webHookRampableModel = mongoose.model('RampableWebHook', rampableWebhookSchema);

module.exports = webHookRampableModel;
