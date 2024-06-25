const express = require('express');
const router = express.Router();
const WithdrawController = require('../controllers/withdraw.controller');
const { handleHttpError } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../db'); // Asumiendo que tienes una función de respuesta

// router.post('/', async (req, res) => {
//     try {
//         const withdraw = await WithdrawController.createWithdraw(req.body);
//         res.json(response(withdraw, 'success'));
//     } catch (error) {
//         handleHttpError(error, res);
//     }
// });

router.get('/', async (req, res) => {
    try {
        const withdraws = await WithdrawController.getWithdraws();
        res.json(response(withdraws, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const withdraw = await WithdrawController.getWithdrawById(req.params.id);
        if (!withdraw) {
            return res.status(404).json(response('Withdraw not found', 'error'));
        }
        res.json(response(withdraw, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

// router.put('/:id', async (req, res) => {
//     try {
//         const withdraw = await WithdrawController.updateWithdraw(req.params.id, req.body);
//         if (!withdraw) {
//             return res.status(404).json(response('Withdraw not found', 'error'));
//         }
//         res.json(response(withdraw, 'success'));
//     } catch (error) {
//         handleHttpError(error, res);
//     }
// });

// router.delete('/:id', async (req, res) => {
//     try {
//         const withdraw = await WithdrawController.deleteWithdraw(req.params.id);
//         if (!withdraw) {
//             return res.status(404).json(response('Withdraw not found', 'error'));
//         }
//         res.json(response('Withdraw deleted', 'success'));
//     } catch (error) {
//         handleHttpError(error, res);
//     }
// });

module.exports = router;
