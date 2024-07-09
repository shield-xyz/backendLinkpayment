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

// RampableController.createRecipients({ name: "nehuen fortes2", email: "nehuenfortes2@gmail.com" }, "667477f6769e23782b7c2984", { currency: "USD", achNumber: "123123123", country: "UNITED STATES", accountNumber: "1919191911", accountName: "nameaccount", bankName: "testNameBank" }, "BOSTON", "address california", "4123").then(res => {
//   console.log(res, "res")
// })
// RampableController.getRecipients("nehuenfortes@gmail.com").then(async (res) => {
//   let user = res.data?.docs[0];
//   console.log(user)

//   //pasos a seguir para funcionamiento de rampable
//   /**
//    * 1-  get recipient user selected
//    * 2-  ver que moneda es la que recibio
//    * 3-  si es alguna que pueda pasar a rampable (bitcoin no es aceptada todavia por ejemplo)
//    * 3.A si junarto me confirma ver si es necesario de filtrar por las que tengan currencies : [USD]
//    * 3.B verificar que el usuario no tenga mas de 5 offramps o 5 , ya que hay limite para este tipo de transacciones.
//    * 4-  crear offramp con datos del cliente, de transaccion
//    * 5-  enviar transaccion por dicha network a dicha wallet de offramp (payoutWallet) // configurar ethereum, polygon,tron?
//    * 6-  algun sistema de verificacion de status, o ver cuando se actualiza la offramp para ver si se envio correctamente y termino el proceso.
//    * 
//    */

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
