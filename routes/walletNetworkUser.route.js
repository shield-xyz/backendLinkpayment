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

// router.post('/', async (req, res) => {
//     try {
//         const newWalletNetworkUser = await walletNetworkUserController.createWalletNetworkUser(req.body);
//         res.json(response(newWalletNetworkUser, "success"));
//     } catch (error) {
//         res.status(500).json(response('Error creating wallet network user', 'error'));
//     }
// });

// router.put('/:id', async (req, res) => {
//     try {
//         const updatedWalletNetworkUser = await walletNetworkUserController.updateWalletNetworkUser(req.params.id, req.body);
//         res.json(response(updatedWalletNetworkUser, "success"));
//     } catch (error) {
//         res.status(500).json(response('Error updating wallet network user', 'error'));
//     }
// });

// router.delete('/:id', async (req, res) => {
//     try {
//         await walletNetworkUserController.deleteWalletNetworkUser(req.params.id);
//         res.json(response('Wallet network user deleted', "success"));
//     } catch (error) {
//         res.status(500).json(response('Error deleting wallet network user', 'error'));
//     }
// });
walletNetworkUserController.ensureWalletNetworkUsersForUser("667477f6769e23782b7c2984").then(res => {
    console.log(res)
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
