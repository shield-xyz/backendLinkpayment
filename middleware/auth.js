// middleware/auth.js
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

module.exports = async function (req, res, next) {
    const token = req.header('x-auth-token');
    const apiKey = req.header('x-api-key');

    if (!token && !apiKey) {
        return res.status(401).json({ msg: 'No token, authorization denied or API key is missing' });
    }


    try {

        if (apiKey) {
            const user = await userModel.findOne({ apiKey });
            req.merchant = user;
            req.user = user;
            if (!user) {
                return res.status(401).json({ error: 'Invalid API key' });
            }
            req.user = user; // Almacena el usuario en el objeto de solicitud para su uso posterior
            next();
            return;
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id).select('-password +admin');
            req.merchant = user;
            req.user = user;
            next();
        }


    } catch (err) {
        console.log(err);
        res.status(401).json({ response: 'Token is not valid', status: "error" });
    }
};
