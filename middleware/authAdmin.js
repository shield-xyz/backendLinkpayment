// middleware/auth.js
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

module.exports = async function (req, res, next) {
    const token = req.header('x-auth-token');
    const apiKey = req.header('x-api-key');

    if (!token && !apiKey) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    if (apiKey) {
        const user = await userModel.findOne({ apiKey, admin: true });
        req.merchant = user;
        req.user = user;
        if (!user) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        next();
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');
        if (user.admin != true) {
            res.status(401).json({
                response: "You don't have the role necessary", status: "error"
            });
            return;
        }
        req.merchant = user;
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ response: 'Token is not valid', status: "error" });
    }
};
