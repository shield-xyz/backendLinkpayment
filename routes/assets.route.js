const express = require('express');
const router = express.Router();
const AssetController = require('../controllers/assets.controller');
const { handleHttpError, response } = require('../utils');


AssetController.createDefault();

router.post('/', async (req, res) => {
    try {
        const asset = await AssetController.createAsset(req.body);
        res.status(201).send(response(asset));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/', async (req, res) => {
    try {
        const assets = await AssetController.getAssets();
        res.send(response(assets));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const asset = await AssetController.updateAsset(req.params.id, req.body);
        if (!asset) {
            return res.status(404).send({ response: 'Asset not found', status: "error" });
        }
        res.send(asset);
    } catch (error) {
        handleHttpError(error, res);
    }
});

// router.delete('/:id', async (req, res) => {
//     try {
//         const asset = await AssetController.deleteAsset(req.params.id);
//         if (!asset) {
//             return res.status(404).send({ response: 'Asset not found', status: "error" });
//         }
//         res.send({ response: 'Asset deleted', status: "success" });
//     } catch (error) {
//         handleHttpError(error, res);
//     }
// });

module.exports = router;
