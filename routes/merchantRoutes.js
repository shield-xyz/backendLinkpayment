// routes/merchantRoutes.js
const express = require('express');
const router = express.Router();
const merchantService = require('../services/merchantService');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    const merchants = await merchantService.getMerchants();
    res.json(merchants);
});

router.get('/:id', auth, async (req, res) => {
    const merchant = await merchantService.getMerchantById(req.params.id);
    res.json(merchant);
});

router.post('/', auth, async (req, res) => {
    const newMerchant = await merchantService.createMerchant(req.body);
    res.json(newMerchant);
});

router.put('/:id', auth, async (req, res) => {
    const updatedMerchant = await merchantService.updateMerchant(req.params.id, req.body);
    res.json(updatedMerchant);
});

router.delete('/:id', auth, async (req, res) => {
    await merchantService.deleteMerchant(req.params.id);
    res.json({ message: 'Merchant deleted' });
});

module.exports = router;
