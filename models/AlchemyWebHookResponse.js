const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlchemyWebHookResponseSchema = new Schema({
    body: { type: Object }
});

const AlchemyWebHookResponseModel = mongoose.model('AlchemyWebHookResponse', AlchemyWebHookResponseSchema);

module.exports = AlchemyWebHookResponseModel;
