const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { response } = require("../utils/index");
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
// URL del servidor externo al que se le harán las solicitudes
const externalServerUrl = process.env.SHIELD_BANK_URL;

// Función para manejar las respuestas
const handleResponse = (respon, res) => {
    respon.json().then(data => {
        res.json(response(data.data, data.status))
        return;
    }).catch(error => {
        res.json(response(error.message, "error"))
        return;
    });
};
// Validaciones para el cuerpo de la solicitud
const bankAccountValidation = [
    body('account_holder_name').notEmpty().withMessage('Account holder name is required'),
    body('account_number').notEmpty().withMessage('Account number is required'),
    body('routing_number').notEmpty().withMessage('Routing number is required'),
    body('bank_name').notEmpty().withMessage('Bank name is required'),
    body('account_type').notEmpty().withMessage('Account type is required'),
    body('address.street').notEmpty().withMessage('Street is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.state').notEmpty().withMessage('State is required'),
    body('address.zip_code').notEmpty().withMessage('Zip code is required'),
    // body('contact_details.email').isEmail().withMessage('Valid email is required'),
    body('contact_details.phone').notEmpty().withMessage('Phone number is required')
];
// Función para manejar errores de validación y devolverlos como un solo string
const formatValidationErrors = (errors) => {
    return errors.map(err => `${err.param}: ${err.msg}`).join(', ');
};
// Crear una nueva cuenta bancaria (POST)
router.post('/', auth, bankAccountValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(response(formatValidationErrors(errors.array()), "error"));
        }

        const response = await fetch(externalServerUrl + "bank/" + req.user._id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        return handleResponse(response, res);
    } catch (error) {
        res.status(500).json({ message: 'Error creating bank account', error: error.message });
    }
});
// actualizar una cuenta bancaria (POST)
router.put('/', auth, bankAccountValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(response(formatValidationErrors(errors.array()), "error"));
        }

        const response = await fetch(externalServerUrl + "bank/" + req.user._id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        return handleResponse(response, res);
    } catch (error) {
        res.status(500).json({ message: 'Error updating bank account', error: error.message });
    }
});

// Obtener todas las cuentas bancarias (GET)
router.get('/', auth, async (req, res) => {
    try {
        const response = await fetch(externalServerUrl + "bank/" + req.user._id, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return handleResponse(response, res);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bank accounts', error: error.message });
    }
});

module.exports = router;
