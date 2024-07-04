const express = require('express');
const router = express.Router();
const BalanceController = require('../controllers/balance.controller');
const { handleHttpError, getPrices, limitDecimals } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../utils/index'); // Asumiendo que tienes una función de respuesta
const auth = require("../middleware/auth");
const AssetController = require('../controllers/assets.controller');
const RampableController = require('../controllers/rampable.controller');

// BalanceController.createBalance({
//   amount: 300,
//   networkId: "tron",
//   assetId: "usdt-tron",
//   userId: "666dc2008eed3ebb921f01b5",
// })

// RampableController.createRecipients({ name: "nehuen fortes", email: "nehuenfortes@gmail.com" }, { currency: "USD", achNumber: "123123123", country: "UNITED STATES", accountNumber: "1919191911", accountName: "nameaccount", bankName: "testNameBank" }, "BOSTON", "address california", "4123").then(res => {
//   // console.log(res)
// })
router.get('/', auth, async (req, res) => {
  try {
    const balances = await BalanceController.findMany({ userId: req.user.id });

    const prices = await getPrices();
    balances.map(x => {
      if (x.assetId.includes("usdt-") || x.assetId.includes("usdc-")) {

        x.usdValue = 1;
      }
      else {
        if (x.assetId == "btc-bitcoin") {
          x.usdValue = (prices?.BTCUSDT) ?? "---";
        }
      }

    })
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
