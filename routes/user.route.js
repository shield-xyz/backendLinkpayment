const auth = require('../middleware/auth');
const logRequest = require('../middleware/logRequest');

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

router.get('/', auth, logRequest, userController.allUsers);
router.get('/:id', auth, logRequest, userController.getUserById);
router.post('/', auth, logRequest, userController.createUser);
router.put('/:id', auth, logRequest, userController.updateUserById);

module.exports = router;
