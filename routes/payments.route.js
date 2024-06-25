const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { handleHttpError, response, validatePayment } = require('../utils/index.js');
const auth = require('../middleware/auth');
const apiKeyUser = require('../middleware/apiKeyUser');
const apiKeyMaster = require('../middleware/apiKeyMaster');
const AssetController = require('../controllers/assets.controller');
const NetworkController = require('../controllers/network.controller.js');
const logger = require('node-color-log');
const TransactionController = require('../controllers/transactions.controller.js');
const getTransactionTron = require('../utils/Tronweb.js');
const {  sendPaymentReceivedPaymentEmail } = require('../controllers/email.controller.js');
const ConfigurationUser = require('../models/configurationUser.model.js');
const { CONFIGURATIONS, NOTIFICATIONS } = require('../config/index.js');
const ConfigurationUserController = require('../controllers/configurationUser.controller.js');
const NotificationsController = require('../controllers/NotificationsUser.controller.js');

router.get('/', apiKeyMaster, async (req, res) => {

    try {
        const payments = await PaymentController.getPayments();
        res.send(response(payments));
    } catch (error) {
        handleHttpError(error, res);
    }
});
router.get('/get/', auth, async (req, res) => {

    try {
        const payments = await PaymentController.getPayments({ userId: req.user.id });
        res.send(response(payments));
    } catch (error) {
        handleHttpError(error, res);
    }
});
router.post('/', apiKeyUser, async (req, res) => {
    try {
        req.body.userId = req.user.id;
        const payment = await PaymentController.createPayment(req.body);
        res.status(201).send(response(payment));
    } catch (error) {
        handleHttpError(error, res);
    }
});


router.get('/get/:id', async (req, res) => {
    try {
        // console.log(req, req.params, "te")
        const payment = await PaymentController.findId(req.params.id);
        res.status(201).send(response(payment));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.put('/:id', apiKeyMaster, async (req, res) => {
    try {
        const payment = await PaymentController.updatePayment({ _id: req.params.id }, req.body);
        if (!payment) {
            return res.status(404).send({ response: 'Payment not found', status: "error" });
        }
        res.send(response(payment));
    } catch (error) {
        handleHttpError(error, res);
    }
});


router.post('/verify', apiKeyMaster, async (req, res) => {
    try {
        let payment = await PaymentController.findId(req.body.paymentId);
        let asset = await AssetController.findOne({ assetId: payment.assetId });
        let network = await NetworkController.findOne({ networkId: asset.networkId });
        let isValid = false;
        let userConf = await ConfigurationUserController.userConfigForUserAndConfigName(payment.userId, CONFIGURATIONS.EMAIL_NAME);
        let resp = await validatePayment(req.body.hash, payment.quote_amount, network, asset, null, req.body.paymentId);
        logger.fontColorLog("green", JSON.stringify(resp),);
        if (resp.status == "success") {

            isValid = true;
            payment.hash = req.body.hash;
            payment.status = "success";
            payment.save();
            let transact = await TransactionController.createTransaction({
                paymentId: req.body.paymentId,
                assetId: asset._id,
                networkId: network._id,
                linkPaymentId: null,
                userId: payment.userId,
                amount: payment.quote_amount,
                hash: req.body.hash
            });
            await NotificationsController.createNotification({
                ...NOTIFICATIONS.NEW_TRANSACTION(payment.quote_amount, asset.symbol, network.name),
                userId: payment.userId
            });
            if (userConf.length > 0 && payment?.user?.email && userConf[0]?.value == "true") {
                await sendPaymentReceivedPaymentEmail(payment.user.email, network.txView + req.body.hash, payment.quote_amount, asset.symbol, network.name, transact._id);
            }

            await PaymentController.loadBalanceImported(req.body.paymentId);
        } else {
            isValid = false;
        }

        if (isValid) {
            res.send(response(payment)); return;

        } else {
            res.send(response("failed")); return;
        }

    } catch (error) {
        console.log(error)
        res.send(response("failed"));
    }
});

// router.delete('/:id', async (req, res) => {
//     try {
//         const payment = await PaymentController.deletePayment(req.params.id);
//         if (!payment) {
//             return res.status(404).send(response('Payment not found', "error"));
//         }
//         res.send(response("Payment deleted"));
//     } catch (error) {
//         handleHttpError(error, res);
//     }
// });

module.exports = router;
