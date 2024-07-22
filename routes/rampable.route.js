const auth = require('../middleware/auth');
const logRequest = require('../middleware/logRequest');

const express = require('express');
const router = express.Router();

const whitdrawModel = require('../models/withdraws.model');

const { response } = require('../utils');
const webHookRampableModel = require('../models/rampable/webHookResponse');
const { sendMessage } = require('../controllers/SlackController');
const { updateStatusOrderTest } = require('../controllers/rampable.controller');
const OffRampModel = require('../models/rampable/offRamp.model');


router.post('/webhook/', async (req, res) => {
    let body = req.body;

    let web = new webHookRampableModel({ body: body })
    await web.save();
    let wt = await whitdrawModel.findOne({ offRampId: body.orderId });
    let offramp = await OffRampModel.findOne({ offrampId: body.orderId })
    console.log(wt, "exist?")
    if (offramp) {
        offramp.status = body.transactionStatus;
        offramp.offRampWebHook = body;
        await offramp.save();

    }
    if (wt) {
        wt.offRampWebHook = body;
        await wt.save()
        await sendMessage("withdraw rampable status : " + body.transactionStatus + " message : " + body.responseMessage)
    }
    res.send({ statusCode: 200, response: "success" })

});
// updateStatusOrderTest("d7edeab2-c342-4971-baa9-ed3f34a0d572")

module.exports = router;
