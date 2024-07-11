const auth = require('../middleware/auth');
const logRequest = require('../middleware/logRequest');

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const userModel = require('../models/user.model');
const { response } = require('../utils');
const webHookRampableModel = require('../models/rampable/webHookResponse');


router.post('/webhook/', async (req, res) => {
    let body = req.body;

    let web = new webHookRampableModel({ body: body })
    await web.save();
    res.send({ statusCode: 200, response: "success" })

});

module.exports = router;
