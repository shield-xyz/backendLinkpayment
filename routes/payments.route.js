const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { handleHttpError, response, getTransactionById, getTransactionTron } = require('../utils');
const auth = require('../middleware/auth');
const apiKeyUser = require('../middleware/apiKeyUser');
const apiKeyMaster = require('../middleware/apiKeyMaster');

router.get('/', apiKeyMaster, async (req, res) => {

    try {
        const payments = await PaymentController.getPayments();
        res.send(response(payments));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.post('/', apiKeyUser, async (req, res) => {
    try {
        req.body.clientId = req.user.id;
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


router.get('/verify/:networkId/:hash', apiKeyMaster, async (req, res) => {
    try {
        let data = {};
        switch (req.params.networkId) {
            case "tron":
                data = await getTransactionTron(req.params.hash)

                break;
            default:
                res.send(response("This network is not available yet", "error")); return;
                break;
        }
        res.send(response(data));
    } catch (error) {
        handleHttpError(error, res);
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
