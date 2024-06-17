const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/account.controller');
const { handleHttpError } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../db'); // Asumiendo que tienes una función de respuesta

router.post('/', async (req, res) => {
    try {
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

router.put('/:id', async (req, res) => {
    try {
        const account = await AccountController.updateAccount(req.params.id, req.body);
        if (!account) {
            return res.status(404).json(response('Account not found', 'error'));
        }
        res.json(response(account, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const account = await AccountController.deleteAccount(req.params.id);
        if (!account) {
            return res.status(404).json(response('Account not found', 'error'));
        }
        res.json(response('Account deleted', 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

module.exports = router;
