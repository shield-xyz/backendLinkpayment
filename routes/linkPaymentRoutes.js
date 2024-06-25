// routes/linkPaymentRoutes.js
const express = require('express');
const router = express.Router();
const linkPaymentService = require('../services/linkPaymentService');
const merchantService = require('../services/merchantService');
const auth = require('../middleware/auth');
const axios = require('axios');
const { response } = require('../db');
const TransactionController = require('../controllers/transactions.controller');
const networksModel = require('../models/networks.model');
const NetworkController = require('../controllers/network.controller');
const { loadBalanceImportedLinkPayment } = require('../controllers/payment.controller');
const LinkPayment = require('../models/LinkPayment');
const { validatePayment } = require('../utils');
const AssetController = require('../controllers/assets.controller');
const { sendTransactionSuccessEmail, sendPaymentReceivedPaymentEmail } = require('../controllers/email.controller');
const ClientsController = require('../controllers/clients.controller');
const ConfigurationUserController = require('../controllers/configurationUser.controller');
const { CONFIGURATIONS, NOTIFICATIONS } = require('../config');
const NotificationsController = require('../controllers/NotificationsUser.controller.js');

router.get('/', auth, async (req, res) => {
    try {
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
        let linkPayment = await linkPaymentService.getLinkPaymentById({ id: req.params.id, status: "pending" });
        if (!linkPayment) {
            return res.status(404).json({ message: 'LinkPayment not found' });
        }
        const merchant = await merchantService.getMerchantById(linkPayment.merchantId);
        if (!merchant) {
            return response('Merchant not found', "error")
        }

        linkPayment = linkPayment.toObject()
        console.log(linkPayment)
        res.json(response(linkPayment));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.post('/walletTriedpayment', async (req, res) => {
    try {
        const linkPayment = await LinkPayment.findOne({ id: req.body.id }).populate("asset");
        if (req.body.wallet != null) {
            linkPayment.walletsTriedPayment.push(req.body.wallet);
        }
        await linkPayment.save();
        res.status(200).send(response([]));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.post('/save/:id', async (req, res) => {
    try {

        // deberia venir assetId, networkId, 
        let { hash, assetId, email, name } = req.body;

        //se obtiene el link
        let linkPayment = await LinkPayment.findOne({ id: req.params.id }).populate("asset user");
        let asset = await AssetController.findOne({ assetId: assetId });
        linkPayment.toObject();

        let network = await NetworkController.findOne({ networkId: asset.networkId });
        if (!asset.assetId) {
            res.status(200).send(response("asset not defined", "error"));
            return;
        }
        let resp = await validatePayment(hash, linkPayment.amount, network, asset, linkPayment.id, null);
        console.log(resp, "respuesta validatePayment")
        if (resp.status == "success") {
            linkPayment.hash.push(hash);
            linkPayment.status = "paid";
            linkPayment.assetId = asset.assetId;
            linkPayment.networkId = asset.networkId;
            await linkPayment.save();
            // payment.hash = req.body.hash;
            // payment.status = "success";
            // payment.save();
            let transact = await TransactionController.createTransaction({
                // paymentId: req.body.paymentId,
                assetId: asset.assetId,
                networkId: asset.networkId,
                linkPaymentId: linkPayment._id,
                userId: linkPayment.merchantId,
                amount: linkPayment.amount,
                hash: hash
            });

            await NotificationsController.createNotification({
                ...NOTIFICATIONS.NEW_TRANSACTION(linkPayment.amount, asset.symbol, network.name),
                userId: payment.userId
            });
            if (email) {
                await sendTransactionSuccessEmail(email, network.txView + hash, linkPayment.amount, asset.symbol, network.name, linkPayment.id, transact._id);
                try {
                    await ClientsController.createClient({
                        email: email, name: name, paymentLinkId: linkPayment.id
                    })

                } catch (error) {
                }
            }
            let userConf = await ConfigurationUserController.userConfigForUserAndConfigName(linkPayment.merchantId, CONFIGURATIONS.EMAIL_NAME);
            if (userConf.length > 0 && linkPayment?.user?.email && userConf[0]?.value == "true") {
                await sendPaymentReceivedPaymentEmail(linkPayment.user.email, network.txView + hash, linkPayment.amount, asset.symbol, network.name, transact._id);
            }

            await loadBalanceImportedLinkPayment(linkPayment)
            res.status(200).send(resp);

        } else {
            // isValid = false;
            res.status(200).send((resp));
        }



    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/all', auth, async (req, res) => {
    try {
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
