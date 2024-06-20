const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { handleHttpError, response, getTransactionById, getTransactionTron, divideByDecimals } = require('../utils/index.js');
const auth = require('../middleware/auth');
const apiKeyUser = require('../middleware/apiKeyUser');
const apiKeyMaster = require('../middleware/apiKeyMaster');
const AssetController = require('../controllers/assets.controller');
const NetworkController = require('../controllers/network.controller.js');
const logger = require('node-color-log');
const TransactionController = require('../controllers/transactions.controller.js');

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
        let data = {};
        switch (req.body.networkId) {
            case "tron":
                data = await getTransactionTron(req.body.hash, req.body.paymentId)
                // validamos fecha de tx 
                let payment = await PaymentController.findId(req.body.paymentId);
                let asset = await AssetController.findOne({ assetId: payment.assetId });
                let network = await NetworkController.findOne({ networkId: asset.networkId });
                // console.log(data)
                // validamos token enviado que sea correcto con el paymentID
                let isValid = false;
                const transactionTimestamp = new Date(data.timestamp);
                const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

                // Validar que la transacción sea de hace 10 minutos o menos
                if (transactionTimestamp < tenMinutesAgo) {
                    res.send(response("failed", "error"));
                    return;
                }

                data.transfersAllList.map(async x => {
                    logger.fontColorLog("blue", "network address ->" + network.deposit_address.toLowerCase())
                    logger.fontColorLog('blue', x.to_address.toLowerCase() == network.deposit_address.toLowerCase());
                    if (x.to_address.toLowerCase() == network.deposit_address.toLowerCase()) // validamos que el que recibio el token es nuestra wallet de tx.
                        if (x.contract_address.toLowerCase() == asset.address.toLowerCase()) {  //primero deberiamos validar que sea el token del asset 
                            //validar la cantidad de token
                            let quantity = divideByDecimals(x.amount_str, x.decimals);
                            console.log(quantity);
                            if (quantity >= payment.quote_amount) {
                                isValid = true;
                                payment.hash = data.hash;
                                payment.status = "success";
                                payment.save();
                                await TransactionController.createTransaction({
                                    paymentId: req.body.paymentId,
                                    assetId: asset._id,
                                    networkId: network._id,
                                    linkPaymentId: null,
                                    userId: payment.userId,
                                    amount: quantity,
                                    hash: req.body.hash
                                });
                                await PaymentController.loadBalanceImported(req.body.paymentId);
                            }
                        }
                })
                if (isValid) {
                    res.send(response(payment)); return;

                } else {
                    res.send(response("failed")); return;
                }
            case "ethereum":

                break;
            default:
                res.send(response("This network is not available yet", "error")); return;
        }
        res.send(response("failed"));
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
