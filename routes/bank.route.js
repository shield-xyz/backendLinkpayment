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
    body('custom.beneficiary_name').notEmpty().withMessage('Beneficiary name is required'),
    body('custom.bank_name').notEmpty().withMessage('Bank name is required'),
    body('custom.account_number').notEmpty().withMessage('Account number is required'),
    body('custom.routing_number').notEmpty().withMessage('Routing number is required'),
    body('custom.country').notEmpty().withMessage('Country is required'),
    body('custom.street_address').notEmpty().withMessage('Street address is required'),
    body('custom.city').notEmpty().withMessage('City is required'),
    body('custom.state').notEmpty().withMessage('State is required'),
    body('custom.zip_code').notEmpty().withMessage('Zip code is required')
];
// Función para manejar errores de validación y devolverlos como un solo string
const formatValidationErrors = (errors) => {
    return errors.map(err => `${err.param}: ${err.msg}`).join(', ');
};
// Crear una nueva cuenta bancaria (POST)
// router.post('/', auth, bankAccountValidation, async (req, res) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(200).json(response(formatValidationErrors(errors.array()), "error"));
//         }

//         const resp = await fetch(externalServerUrl + "bank/" + req.user._id, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(req.body)
//         });
//         return handleResponse(resp, res);
//     } catch (error) {
//         res.status(200).json(response('Error creating bank account', "error"));
//     }
// });
// actualizar una cuenta bancaria (POST)
router.put('/', auth, bankAccountValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(response(formatValidationErrors(errors.array()), "error"));
        }
        if (!req.user.footId) {
            return res.status(200).json(response("User foot Id not found", "error"));
        }
        req.user.footId = "fp_id_test_Ma33pMQFO4MCgJ8WVwMRfY"
        const resp = await fetch("https://api.onefootprint.com/users/" + req.user.footId + "/vault", {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', "X-Footprint-Secret-Key": process.env.FOOTPRINT_SECRET_KEY },
            body: JSON.stringify(req.body)
        });
        console.log(resp)
        return handleResponse(resp, res);
    } catch (error) {
        console.log(error)
        res.status(200).json(response('Error updating bank account', "error"));
    }
});

router.get('/verify', auth, async (req, res) => {
    try {
        const resp = await fetch(externalServerUrl + "user/" + req.user._id, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (resp.status == "success" && res.data.verification_status == "verified") {
            req.user.verify = true;
            await req.user.save();
        }
        return handleResponse(resp, res);
    } catch (error) {
        res.status(200).json(response('Error verify user', "error"));
    }
});
// Obtener la cuenta bancaria del usuario
router.get('/', auth, async (req, res) => {
    try {
        req.user.footId = "fp_id_test_Ma33pMQFO4MCgJ8WVwMRfY"
        const resp = await fetch("https://api.onefootprint.com/users/" + req.user.footId + "/vault/decrypt", {
            method: 'POST',
            headers: { "X-Footprint-Secret-Key": process.env.FOOTPRINT_SECRET_KEY },
            body: JSON.stringify({
                "fields": [
                    "custom.beneficiary_name",
                    "custom.country",
                    "custom.city",
                    "custom.routing_number",
                    "custom.zip_code",
                    "custom.account_number",
                    "custom.state",
                    "custom.bank_name",
                    "custom.street_address"
                ],
                "reason": "Getting client bank details"
            })
        });

        return res.status(200).json(response(await resp.json()))
        return
    } catch (error) {
        res.status(200).json(response('Error fetching bank accounts', "error"));
    }
});

module.exports = router;
