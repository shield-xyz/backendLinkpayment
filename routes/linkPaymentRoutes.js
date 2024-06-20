// routes/linkPaymentRoutes.js
const express = require('express');
const router = express.Router();
const linkPaymentService = require('../services/linkPaymentService');
const merchantService = require('../services/merchantService');
const auth = require('../middleware/auth');
const axios = require('axios');
const { response } = require('../db');
const { getTransactionTron } = require('../utils');

router.get('/', auth, async (req, res) => {
    try {
        console.log(req.user)
        const linkPayments = await linkPaymentService.getLinkPayments({ merchantId: req.user._id });
        res.json(linkPayments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
const getTransactionStatus = async (txHash) => {
    try {
        // URL de la API de TronGrid
        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'application/json' },
            body: JSON.stringify({ value: txHash })
        };

        let data = await fetch('https://api.trongrid.io/wallet/gettransactioninfobyid', options)
        data = await data.json()
        return response(data);

    } catch (error) {
        console.error('Error fetching transaction status:', error);
        return response(error, "error")
    }
};

router.get('/get/:id', async (req, res) => {
    try {
        const linkPayment = await linkPaymentService.getLinkPaymentById({ id: req.params.id, status: "pending" });
        if (!linkPayment) {
            return res.status(404).json({ message: 'LinkPayment not found' });
        }
        const merchant = await merchantService.getMerchantById(linkPayment.merchantId);
        if (!merchant) {
            return response('Merchant not found', "error")
        }
        // Convertir a objeto plano y eliminar la contraseña
        const merchantWithoutPassword = { ...merchant.toObject(), password: undefined };
        // Convertir linkPayment a objeto plano y agregar el merchant
        const linkPaymentWithMerchant = { ...linkPayment.toObject(), merchant: merchantWithoutPassword };

        res.json(response(linkPaymentWithMerchant));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.post('/walletTriedpayment', async (req, res) => {
    try {

        let statusTX = await getTransactionStatus(req.body.id);
        if (statusTX.result == "CONFIRMED") {

            const linkPayment = await linkPaymentService.addWalletTriedPayment(req.body.id, req.body.wallet);
        } else {

        }
        res.status(200).send(response([]));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.post('/loadhash', async (req, res) => {
    try {

        let statusTX = await getTransactionTron(req.body.hash);

        if (statusTX.contractRet == "SUCCESS") {

            const linkPayment = await linkPaymentService.addWalletTriedPayment(req.body.id, req.body.wallet);
        } else {

        }
        res.status(200).send(response([]));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.post('/save/:id', async (req, res) => {
    try {
        const linkPayment = await linkPaymentService.addWalletTriedPayment(req.params.id, null, req.body.hash);
        res.status(200).send(response([]));

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/all', auth, async (req, res) => {
    try {
        // console.log(req)
        const linkPayment = await linkPaymentService.getLinkPaymentByMerchantId(req.user.id);
        if (!linkPayment) {
            return res.status(404).json(response('LinkPayment not found', "error"));
        }
        res.json(linkPayment);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/pause', auth, async (req, res) => {
    try {
        console.log(req.user)
        const linkPayment = await linkPaymentService.updateLinkPayment(req.body.id, req.user._id, { status: "Paused" });
        res.status(200).send(response(linkPayment));

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const merchantId = req.user.id; // Obtener merchantId del token
        console.log(merchantId, "merchant")
        const newLinkPayment = await linkPaymentService.createLinkPayment(req.body, merchantId);
        res.json(response(newLinkPayment));
    } catch (err) {
        console.error(err);
        res.status(500).send(response('Server Error', "error"));
    }
});


router.delete('/:id', auth, async (req, res) => {
    // try {
    //     await linkPaymentService.deleteLinkPayment(req.params.id);
    //     res.json({ message: 'LinkPayment deleted' });
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).send('Server Error');
    // }
});


module.exports = router;
