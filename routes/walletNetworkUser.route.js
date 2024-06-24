const express = require('express');
const router = express.Router();
const walletNetworkUserController = require('../controllers/walletNetworkUser.controller');
const { response } = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const walletNetworkUsers = await walletNetworkUserController.getWalletNetworkUsers({ userId: req.user._id });
        res.json(response(walletNetworkUsers, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching wallet network users', 'error'));
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const walletNetworkUser = await walletNetworkUserController.getWalletNetworkUsers({ _id: req.params.id, userId: req.user._id });
        res.json(response(walletNetworkUser, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching wallet network user', 'error'));
    }
});


// Endpoint para asegurar que cada usuario tenga una wallet por network
router.post('/ensure/:userId', async (req, res) => {
    try {
        const newWallets = await walletNetworkUserController.ensureWalletNetworkUsersForUser(req.params.userId);
        res.json(response(newWallets, "success"));
    } catch (error) {
        res.status(500).json(response('Error ensuring wallet network users for user', 'error'));
    }
});

module.exports = router;
