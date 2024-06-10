// middleware/auth.js
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

module.exports = async function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('-password');
        req.merchant = user;
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ response: 'Token is not valid', status: "error" });
    }
};
