const express = require('express');
const router = express.Router();
const ClientsController = require('../controllers/clients.controller');
const { handleHttpError } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../db'); // Asumiendo que tienes una función de respuesta
const apiKeyMaster = require('../middleware/apiKeyMaster');

router.post('/', apiKeyMaster, async (req, res) => {
    try {
        const client = await ClientsController.createClient(req.body);
        res.json(response(client, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/', apiKeyMaster, async (req, res) => {
    try {
        const clients = await ClientsController.getClients();
        res.json(response(clients, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/:id', apiKeyMaster, async (req, res) => {
    try {
        const client = await ClientsController.getClientById(req.params.id);
        if (!client) {
            return res.status(404).json(response('Client not found', 'error'));
        }
        res.json(response(client, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.put('/:id', apiKeyMaster, async (req, res) => {
    try {
        const client = await ClientsController.updateClient(req.params.id, req.body);
        if (!client) {
            return res.status(404).json(response('Client not found', 'error'));
        }
        res.json(response(client, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.delete('/:id', apiKeyMaster, async (req, res) => {
    try {
        const client = await ClientsController.deleteClient(req.params.id);
        if (!client) {
            return res.status(404).json(response('Client not found', 'error'));
        }
        res.json(response('Client deleted', 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

// router.post('/:id/generate-api-key', async (req, res) => {
//     try {
//         const apiKey = await ClientsController.generateApiKey(req.params.id);
//         res.json(response({ apiKey }, 'success'));
//     } catch (error) {
//         handleHttpError(error, res);
//     }
// });

module.exports = router;
