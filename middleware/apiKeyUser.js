const clientsModel = require('../models/clients.model');
const User = require('../models/user.model'); // Asegúrate de tener un modelo de Usuario

const apiKeyUser = async (req, res, next) => {
    const apiKey = req.header('x-api-key');

    if (!apiKey) {
        return res.status(401).json({ error: 'API key is missing' });
    }

    try {
        const user = await User.findOne({ apiKey });
        req.client = user;
        if (!user) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        req.user = user; // Almacena el usuario en el objeto de solicitud para su uso posterior
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = apiKeyUser;
