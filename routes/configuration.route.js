const express = require('express');
const router = express.Router();
const ConfigurationController = require('../controllers/configuration.controller');
const ConfigurationUserController = require('../controllers/configurationUser.controller');
const { response } = require('../db');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const configurations = await ConfigurationController.getConfigurations();
        res.json(response(configurations, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching configurations', 'error'));
    }
});




router.get('/user/', auth, async (req, res) => {
    try {
        const configurations = await ConfigurationUserController.getConfigurationUsers({ userId: req.user._id });
        res.json(response(configurations, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching configurations', 'error'));
    }
});
router.get('/:id', async (req, res) => {
    try {
        const configuration = await ConfigurationController.getConfigurationById(req.params.id);
        res.json(response(configuration, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching configuration', 'error'));
    }
});

router.get('/user/:id', auth, async (req, res) => {
    try {
        const configurations = await ConfigurationUserController.getConfigurationUsers({ userId: req.user._id, _id: req.params.id });
        res.json(response(configurations, "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching configurations', 'error'));
    }
});



module.exports = router;
