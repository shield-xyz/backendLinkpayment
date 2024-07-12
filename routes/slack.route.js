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
            console.log(event)
            if (event.text)
                if (event.channel == process.env.SLACK_CHANNEL && !event.bot_id) {
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
                    if (event.text.includes("withdraw rampable|")) {
                        let args = event.text.split("|");
                        console.log(args, "args")
                        let amount = Number(args[2]);
                        let balanceId = args[1];
                        await SlackController.generateWithDrawRampable(amount, balanceId);
                        return res.send({});

                    }
                    if (event.text.includes("list withdraws")) {

                        await SlackController.listWithDraws()


                        return res.send({});

                    }
                    if (event.text.includes("status|")) {

                        let args = event.text.split("|");
                        console.log(args, "args")
                        let status = args[2];
                        switch (status) {
                            case "pending": break;
                            case "success": break;
                            case "error": break;
                            default:
                                await SlackController.sendMessage("status should be: pending or success or error");
                                return res.send({});
                                break;
                        }
                        await SlackController.changeStatusWithdraw(args[1], status)
                        return res.send({});

                    }
                    if (event.text.includes("tokenReceived|")) {
                        let args = event.text.replace(/%7C/g, "|").split("|");
                        console.log(args, "args")
                        let amount = args[1], email = args[2].replace("<mailto:", "");
                        try {
                            await SlackController.sendManualEmail("sendTokenReceivedManual", email, amount);

                            await SlackController.sendMessage("email sended ");
                        } catch (error) {
                            console.log(error, "error sending email");
                            await SlackController.sendMessage("error in sending message " + error.message);
                        }
                    }
                    if (event.text.includes("transferInitiated|")) {
                        let args = event.text.replace(/%7C/g, "|").split("|");
                        console.log(args, "args")
                        let amount = args[1], email = args[2].replace("<mailto:", "");
                        try {
                            await SlackController.sendManualEmail("transferInitiated", email, amount);

                            await SlackController.sendMessage("email sended ");
                        } catch (error) {
                            console.log(error, "error sending email");
                            await SlackController.sendMessage("error in sending message " + error.message);
                        }
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
