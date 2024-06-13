const express = require('express');
const router = express.Router();
const NetworkController = require('../controllers/network.controller');
const { handleHttpError, response } = require('../utils/index.js');
const authAdmin = require('../middleware/authAdmin');


NetworkController.createDefault();

router.post('/', authAdmin, async (req, res) => {
    try {
        const network = await NetworkController.createNetwork(req.body);

        res.status(201).send(response(network, (network?.networkId) ? "success" : "error"));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/', async (req, res) => {
    try {
        const networks = await NetworkController.getNetworks({ deposit_address: { $ne: "" } });
        res.send(response(networks));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.put('/:id', authAdmin, async (req, res) => {
    try {
        const network = await NetworkController.updateNetwork(req.params.networkId, req.body);
        if (!network) {
            return res.status(404).send({ response: 'Network not found', status: "error" });
        }
        res.send(response(network));
    } catch (error) {
        handleHttpError(error, res);
    }
});


module.exports = router;
