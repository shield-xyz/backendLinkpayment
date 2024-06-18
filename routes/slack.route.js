const express = require('express');
const router = express.Router();
const NetworkController = require('../controllers/network.controller');
const { handleHttpError, response } = require('../utils/index.js');
const authAdmin = require('../middleware/authAdmin');
const BalanceController = require("../controllers/balance.controller.js");
const UserController = require("../controllers/user.controller.js");
const balanceModel = require('../models/balance.model.js');
const userModel = require('../models/user.model.js');
const SlackController = require('../controllers/SlackController.js');
const WithdrawController = require('../controllers/withdraw.controller.js');
const accountModel = require('../models/account.model.js');

NetworkController.createDefault();

router.post('/challenge', async (req, res) => {
    try {

        let event = req.body.event;
        if (event.type == "message") {
            if (event.channel == process.env.SLACK_CHANNEL) {
                if (event.text.includes("list balances")) {
                    await SlackController.listBalances();
                }
                if (event.text.includes("withdraw|")) {
                    let args = event.text.split("|");
                    console.log(args, "args")
                    let amount = Number(args[2]);
                    let balanceId = args[1];
                    await SlackController.generateWithDraw(amount, balanceId);
                    return res.send({});

                }
                if (event.text.includes("list withdraws")) {

                    await SlackController.listWithDraws()


                    return res.send({});

                }
            }
        }
        res.send({ challenge: req.body.challenge }); return;

    } catch (error) {
        handleHttpError(error, res);
    }
});


module.exports = router;
