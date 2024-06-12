const clientsModel = require('../models/clients.model');
const User = require('../models/user.model'); // Asegúrate de tener un modelo de Usuario

const apiKeyMaster = async (req, res, next) => {
    const apiKey = req.header('x-api-key');

    if (!apiKey) {
        return res.status(401).json({ error: 'API key is missing' });
    }
    try {
        if (apiKey != process.env.API_KEY_MASTER) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = apiKeyMaster;
