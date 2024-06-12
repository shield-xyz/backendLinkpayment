// routes/authRoutes.js
const express = require('express');
const path = require('path');
const authController = require('../controllers/auth.controller');
const logRequest = require('../middleware/logRequest');
const { upload, response } = require('../utils');
const auth = require('../middleware/auth');
const router = express.Router();
const crypto = require('crypto');



router.post('/login', logRequest, authController.login);
router.post('/register', upload.single('logo'), logRequest, authController.register);
router.post('/generate-api-key', auth, async (req, res) => {
    try {
        const user = req.merchant; // Asumimos que el middleware `auth` añade el usuario a la solicitud
        user.apiKey = crypto.randomBytes(16).toString('hex');
        await user.save();
        res.json(response({ apiKey: user.apiKey }));
    } catch (error) {
        console.log(error);
        res.status(200).json({ response: 'Internal server error', status: "error" });
    }
});

module.exports = router;
