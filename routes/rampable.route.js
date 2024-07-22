const auth = require('../middleware/auth');
const logRequest = require('../middleware/logRequest');

const express = require('express');
const router = express.Router();

const whitdrawModel = require('../models/withdraws.model');

const { response } = require('../utils');
const webHookRampableModel = require('../models/rampable/webHookResponse');
const { sendMessage } = require('../controllers/SlackController');


router.post('/webhook/', async (req, res) => {
    let body = req.body;

    let web = new webHookRampableModel({ body: body })
    await web.save();
    let wt = await whitdrawModel.findOne({ offRampId: body.orderId });
    wt.offRampWebHook = body;
    await wt.save()
    await sendMessage("withdraw rampable status : " + body.transactionStatus + " message : " + body.responseMessage)
    res.send({ statusCode: 200, response: "success" })

});

module.exports = router;
