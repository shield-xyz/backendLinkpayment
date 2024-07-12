const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/account.controller');
const { handleHttpError } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../db'); // Asumiendo que tienes una función de respuesta
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
    try {
        req.body.userId = req.user._id;
        const account = await AccountController.createAccount(req.body);
        res.json(response(account, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/', async (req, res) => {
    try {
        const accounts = await AccountController.getAccounts();
        res.json(response(accounts, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const account = await AccountController.getAccountById(req.params.id);
        if (!account) {
            return res.status(404).json(response('Account not found', 'error'));
        }
        res.json(response(account, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const account = await AccountController.updateAccount({ _id: req.params.id, userId: req.user._id }, req.body);
        if (!account) {
            return res.status(404).json(response('Account not found', 'error'));
        }
        res.json(response(account, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const account = await AccountController.deleteAccount({ _id: req.params.id, userId: req.user._id });
        if (!account) {
            return res.status(404).json(response('Account not found', 'error'));
        }
        res.json(response('Account deleted', 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

module.exports = router;
