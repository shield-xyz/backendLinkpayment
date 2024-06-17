const express = require('express');
const router = express.Router();
const NetworkController = require('../controllers/network.controller');
const { handleHttpError, response } = require('../utils/index.js');
const authAdmin = require('../middleware/authAdmin');


NetworkController.createDefault();

router.post('/challenge', async (req, res) => {
    try {
        // {
        //     "token": "Jhj5dZrVaK7ZwHHjRyZWjbDl",
        //         "challenge": "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P",
        //             "type": "url_verification"
        // };
        res.send({ challenge: req.body.challenge }); return;

    } catch (error) {
        handleHttpError(error, res);
    }
});


module.exports = router;
