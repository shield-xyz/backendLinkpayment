const express = require('express');
const router = express.Router();
const BalanceController = require('../controllers/balance.controller');
const { handleHttpError } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../utils/index'); // Asumiendo que tienes una función de respuesta
const auth = require("../middleware/auth");
const AssetController = require('../controllers/assets.controller');

// BalanceController.createBalance({
//   amount: 300,
//   networkId: "tron",
//   assetId: "usdt-tron",
//   userId: "666dc2008eed3ebb921f01b5",
// })
router.get('/', auth, async (req, res) => {
  try {
    const assets = await AssetController.getAssets({ active: true });
    const balances = await BalanceController.findMany({ userId: req.user.id });
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if (balances.find(x => x.assetId == asset.assetId) == undefined) {
        let b = await BalanceController.createBalance({
          amount: 0, networkId: asset.networkId, assetId: asset.assetId, userId: req.user.id
        })
        balances.push(b);
      }

    }
    res.json(response(balances, 'success'));
  } catch (error) {
    handleHttpError(error, res);
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const balance = await BalanceController.getBalanceById(req.params.id);
    if (!balance) {
      return res.status(404).json(response('Balance not found', 'error'));
    }
    if (balance.userId == req.user.id) {

      res.json(response(balance, 'success'));
    } else {
      res.json(response({}, 'success'));

    }
  } catch (error) {
    handleHttpError(error, res);
  }
});


module.exports = router;
