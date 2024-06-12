// routes/authRoutes.js
const express = require('express');
const path = require('path');
const authController = require('../controllers/auth.controller');
const logRequest = require('../middleware/logRequest');
const { upload } = require('../utils');
const router = express.Router();




router.post('/login', logRequest, authController.login);
router.post('/register', upload.single('logo'), logRequest, authController.register);


module.exports = router;
