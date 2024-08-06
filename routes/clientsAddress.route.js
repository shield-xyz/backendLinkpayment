// routes/clientsRoutes.js
const express = require('express');
const router = express.Router();
const clientsAddressController = require('../controllers/clientsAddressController');
const { response } = require('../db');
const auth = require('../middleware/auth');
const apiKeyMaster = require('../middleware/apiKeyMaster');
const { getWhatsAppGroups } = require('../utils');

router.get('/', apiKeyMaster, async (req, res) => {
    try {
        const clients = await clientsAddressController.getClients();
        res.json(response(clients, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching clients', 'error'));
    }
});

router.get('/admin/', apiKeyMaster, async (req, res) => {
    try {
        const clients = await clientsAddressController.getClients();
        res.json(response(clients, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching clients', 'error'));
    }
});


router.post('/groupsWpp/', apiKeyMaster, async (req, res) => {
    try {
        const groups = await getWhatsAppGroups();
        res.json(response(groups, "success"));
    } catch (error) {
        res.status(500).json(response(error.message, 'error'));
    }
});

router.get('/wallet/:address', apiKeyMaster, async (req, res) => {
    try {
        const client = await clientsAddressController.getClientByWalletAddress(req.params.address);
        if (!client) return res.status(404).json(response('Client not found', 'error'));
        res.json(response(client, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching client by wallet address', 'error'));
    }
});

router.post('/', apiKeyMaster, async (req, res) => {
    try {
        const newClient = await clientsAddressController.createClient(req.body);
        res.json(response(newClient, "success"));
    } catch (error) {
        res.status(500).json(response('Error creating client', 'error'));
    }
});

router.put('/:id', apiKeyMaster, async (req, res) => {
    try {
        const updatedClient = await clientsAddressController.updateClient({ _id: req.params.id }, req.body);
        if (!updatedClient) return res.status(404).json(response('Client not found', 'error'));
        res.json(response(updatedClient, "success"));
    } catch (error) {
        res.status(500).json(response('Error updating client', 'error'));
    }
});

router.delete('/:id', apiKeyMaster, async (req, res) => {
    try {
        await clientsAddressController.deleteClient(req.params.id);
        res.json(response('Client deleted', "success"));
    } catch (error) {
        res.status(500).json(response('Error deleting client', 'error'));
    }
});

module.exports = router;
