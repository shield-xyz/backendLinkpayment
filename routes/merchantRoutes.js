const express = require('express');
const router = express.Router();
const merchantService = require('../services/merchantService');
const auth = require('../middleware/auth');
const { response } = require('../db');
const authAdmin = require('../middleware/authAdmin');
const { handleHttpError, upload } = require('../utils/index.js'); // Asumo que tienes un manejador de errores

router.get('/', auth, async (req, res) => {
    try {
        const merchants = await merchantService.getMerchants();
        res.json(response(merchants));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/user/:id', authAdmin, async (req, res) => {
    try {
        const merchant = await merchantService.getMerchantById(req.params.id);
        res.json(response(merchant));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.put('/user/:id', authAdmin, async (req, res) => {
    try {
        const updatedMerchant = await merchantService.updateMerchant(req.params.id, req.body, req);
        res.json(response(updatedMerchant));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/me/', auth, async (req, res) => {
    try {
        const merchant = await merchantService.getMerchantById(req.merchant._id, "-password -admin -createdAt -updatedAt");
        res.json(response(merchant));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.put('/me/', auth, upload.single('logo'), async (req, res) => {
    try {
        // Validar la contraseña
        if (req.body.password) {
            const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
            if (!passwordRegex.test(req.body.password)) {
                return res.status(200).json(response('Password must be at least 8 characters long and contain at least one special character.', "error"));
            }
        }
        const updatedMerchant = await merchantService.updateMerchant(req.merchant._id, req.body, req);
        res.json(response(updatedMerchant));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const newMerchant = await merchantService.createMerchant(req.body);
        res.json(response(newMerchant));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await merchantService.deleteMerchant(req.params.id);
        res.json(response('Merchant deleted'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

module.exports = router;
