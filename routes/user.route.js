const auth = require("../middleware/auth");
const logRequest = require("../middleware/logRequest");

const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const userModel = require("../models/user.model");
const { response, footPrintUser } = require("../utils");

router.get("/", auth, logRequest, userController.allUsers);
router.get("/:id", auth, logRequest, userController.getUserById);
router.post("/", auth, logRequest, userController.createUser);
router.put("/:id", auth, logRequest, userController.updateUserById);
router.post("/user/validate", auth, async (req, res) => {
  const data = await footPrintUser(req.body.validation_token);
  if (data?.user_auth?.fp_id) {
    req.user.footId = data?.user_auth?.fp_id;
    await req.user.save();
  }

  return res.send(response(req.user));
});

router.get("/user/foot/:id", auth, async (req, res) => {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Footprint-Secret-Key": process.env.FOOTPRINT_SECRET_KEY,
    },
  };
  const resp = await fetch(
    `https://api.onefootprint.com/users/${req.params.id}`,
    options
  ); //
  const data = await resp.json();

  return res.send(response(data));
});

router.post("/foot/token", auth, async (req, res) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Footprint-Secret-Key": process.env.FOOTPRINT_SECRET_KEY,
    },
    body: JSON.stringify(req.body),
  };

  const resp = await fetch(
    `https://api.onefootprint.com/users/${req.user.footId}/token`,
    options
  );

  const data = await resp.json();

  return res.send(response(data));
});

module.exports = router;
