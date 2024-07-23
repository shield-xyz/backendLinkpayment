const express = require('express');
const router = express.Router();
const NetworkController = require('../controllers/network.controller');
const { handleHttpError, response, sendMessageTwilio } = require('../utils/index.js');
const authAdmin = require('../middleware/authAdmin');
const BalanceController = require("../controllers/balance.controller.js");
const UserController = require("../controllers/user.controller.js");
const balanceModel = require('../models/balance.model.js');
const userModel = require('../models/user.model.js');
const SlackController = require('../controllers/SlackController.js');
const WithdrawController = require('../controllers/withdraw.controller.js');
const accountModel = require('../models/account.model.js');
const logger = require('node-color-log');

function cleanPhoneNumber(input) {
    // Partir la cadena por el delimitador '|'
    let parts = input.split('|');

    // Obtener la parte del número de teléfono, que es el último elemento
    let phonePart = parts[2];

    // Usar una expresión regular para extraer solo los dígitos del número de teléfono
    let cleanedPhone = phonePart.match(/\d+/g).join('');
    console.log(parts, "cleaned phone")
    // Reconstruir la cadena con el número de teléfono limpio
    parts[2] = parts[3].replace(">", "");

    // Unir las partes de nuevo con '|'
    return parts.join('|');
}
router.post('/challenge', async (req, res) => {
    try {

        let text = "";

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
                        text = event.text.replace(/%7C/g, "|").split("|");
                        if (event.text.includes("<tel"))
                            text = cleanPhoneNumber(event.text.replace(/%7C/g, "|")).split("|");

                        let args = text;
                        console.log(args, "args")
                        let amount = args[1].replace("<mailto:", ""), number = args[2].replace("<mailto:", "");
                        try {
                            let ress = await sendMessageTwilio(number, amount, 1);
                            if (ress.status == "success") {
                                await SlackController.sendMessage("Message status :" + ress.status + " sent to user +" + number);
                            } else {
                                logger.warn(ress);
                                await SlackController.sendMessage("Failed to send the message, error: " + ress.response?.msg);
                            }

                        } catch (error) {
                            console.log(error, "error sending email");
                            await SlackController.sendMessage("error in sending message " + error.message);
                        }
                    }
                    
                    if (event.text.includes("transferInitiated|")) {
                        text = event.text.replace(/%7C/g, "|").split("|");

                        if (event.text.includes("<tel"))
                            text = cleanPhoneNumber(event.text.replace(/%7C/g, "|")).split("|");

                        let args = text
                        console.log(args, "args")
                        let amount = args[1].replace("<mailto:", ""), number = args[2].replace("<mailto:", "");
                        try {
                            let ress = await sendMessageTwilio(number, amount, 2);
                            if (ress.status == "success") {
                                await SlackController.sendMessage("Message status :" + ress.status + " sent to user +" + number);
                            } else {
                                logger.warn(ress);
                                await SlackController.sendMessage("Failed to send the message, error: " + ress.response?.msg);
                            }

                        } catch (error) {
                            console.log(error, "error sending email");
                            await SlackController.sendMessage("error in sending message " + error.message);
                        }
                    }


                    if (event.text.includes("tokenReceived email|")) {
                        let args = event.text.replace(/%7C/g, "|").split("|");
                        console.log(args, "args")
                        let amount = args[1].replace("<mailto:", ""), email = args[2].replace("<mailto:", "");
                        try {
                            await SlackController.sendManualEmail("sendTokenReceivedManual", email, amount);

                            await SlackController.sendMessage("email sent ");
                        } catch (error) {
                            console.log(error, "error sending email");
                            await SlackController.sendMessage("error in sending message " + error.message);
                        }
                    }
                    if (event.text.includes("transferInitiated email|")) {
                        let args = event.text.replace(/%7C/g, "|").split("|");
                        console.log(args, "args")
                        let amount = args[1].replace("<mailto:", ""), email = args[2].replace("<mailto:", "");
                        try {
                            await SlackController.sendManualEmail("transferInitiated", email, amount);

                            await SlackController.sendMessage("email sent ");
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
