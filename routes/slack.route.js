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
                if (event.text.includes("withdraw status ")) {

                    let args = event.text.split("|");
                    console.log(args, "args")
                    let status = args[1];
                    switch (status) {
                        case "pending": break;
                        case "success": break;
                        case "error": break;
                        default:
                            await SlackController.sendMessage("status should be: pending or success or error");
                            return res.send({});
                            break;
                    }
                    await SlackController.changeStatusWithdraw(args[0], status)
                    return res.send({});

                }
            }
        }
        res.send({ challenge: req.body.challenge }); return;

    } catch (error) {
        await SlackController.sendMessage("error " + error.message);
        handleHttpError(error, res);
    }
});


module.exports = router;
