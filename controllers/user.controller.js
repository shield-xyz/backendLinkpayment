const User = require('../models/user.model');
const { handleHttpError } = require('../utils');

const UserController = {
  async allUsers(req, res) {
    try {
      const users = await User.find();
      res.send({ users });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getUserById(req, res) {
    if (req.params.id === undefined) {
      handleHttpError(new Error('User id can not be empty!'), res, 400);
      return;
    }

    try {
      const user = await User.findById(req.params.id);
      res.send({ user });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async createUser(req, res) {
    if (
      req.body === undefined ||
      req.body.user_name === undefined ||
      !req.body.user_name
    ) {
      handleHttpError(new Error('User name can not be empty!'), res, 400);
      return;
    }

    const user = new User({
      user_name: req.body.user_name,
      email: req.body.email,
      password: req.body.password,
      btc_wallet: req.body.btc_wallet,
      ether_wallet: req.body.ether_wallet,
      tron_wallet: req.body.tron_wallet,
    });

    try {
      await user.save();

      const users = await User.find();

      res.send({ users });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async updateUserById(req, res) {
    if (req.params.id === undefined || req.body == undefined) {
      handleHttpError(
        new Error('User id and content can not be empty!'),
        res,
        400
      );
      return;
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body);

      res.send({ user });
    } catch (err) {
      handleHttpError(err, res);
    }
  },
};

module.exports = UserController;
