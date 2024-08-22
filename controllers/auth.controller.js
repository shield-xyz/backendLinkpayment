const logger = require('node-color-log');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const UserModel = require('../models/user.model');
const { JWT_SECRET } = require('../config');
const {
  handleHttpError,
  response,
  footPrintUser,
  footPrintUserEmail,
  isFootprintUserVerified,
} = require('../utils/index.js');
const secretKey = JWT_SECRET;
const {
  ensureWalletNetworkUsersForUser,
} = require('./walletNetworkUser.controller.js');
const {
  sendPasswordResetEmail,
  sendConfirmVerificationSubmittedEmail,
} = require('./email.controller.js');
const BalanceController = require('./balance.controller.js');

module.exports = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email: email });

      if (!user) {
        res
          .status(200)
          .send({ response: 'Invalid credentials.', status: 'error' });

        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res
          .status(200)
          .send({ response: 'Invalid credentials.', status: 'error' });
        return;
      }

      const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '3h' });
      const response = {
        _id: user._id,
        user_name: user.user_name,
        email: user.email,
        token,
        logo: user.logo,
        company: user.company,
        apiKey: user.apiKey,
        verify: user.verify,
        footId: user.footId,
        admin: user.admin ? user.admin : false,
      };

      console.log(response);
      res.send({ response: response, status: 'success' });
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async loginFootPrint(req, res) {
    try {
      const { validation_token } = req.body;

      let user_foot = await footPrintUser(validation_token);
      let user = null;

      logger.info(user_foot);

      if (user_foot?.user_auth?.fp_id) {
        fp_id = user_foot?.user_auth?.fp_id;
        user = await UserModel.findOne({ footId: fp_id });
        //buscar email en footprint
        let userEmail = await footPrintUserEmail(fp_id);
        if (!user && userEmail['id.email']) {
          user = await UserModel.findOne({ email: userEmail['id.email'] });
          user.footId = fp_id;
          await user.save();
        }
      }

      if (user) {
        const verified = await isFootprintUserVerified(fp_id);

        if (user.verify !== verified) {
          logger.info('updating user verification status to', verified);
          user.verify = verified;
          await user.save();
        }

        const token = jwt.sign({ id: user._id }, secretKey, {
          expiresIn: '3h',
        });

        const response = {
          _id: user._id,
          user_name: user.user_name,
          email: user.email,
          token,
          logo: user.logo,
          company: user.company,
          apiKey: user.apiKey,
          verify: user.verify,
          footId: user.footId,
          admin: user.admin ? user.admin : false,
        };
        res.send({ response: response, status: 'success' });
      } else {
        res.send({ response: 'user not found', status: 'error' });
      }
    } catch (error) {
      handleHttpError(error, res, 200);
    }
  },

  async register(req, res) {
    try {
      const { user_name, email, password, company, validation_token } =
        req.body;
      let fp_id = null;
      // Obtener el nombre del archivo subido
      const filename = req.file?.filename ? req.file?.filename : 'default.jpg';
      // console.log(filename)

      const alreadyExists = await UserModel.findOne({ email: email });

      if (alreadyExists) {
        handleHttpError(new Error('Email already taken.'), res, 200);
        return;
      }
      // Validar la contraseña
      // const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      // if (!passwordRegex.test(password)) {
      //     return res.status(200).json(response('Password must be at least 8 characters long and contain at least one special character.', "error"));
      // }
      // Validar el email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json(response('Invalid email format.', 'error'));
      }
      const salt = bcrypt.genSaltSync(10);
      let hashed_password = bcrypt.hashSync('passwordSecret123#', salt);
      logger.info({ email, password, user_name });
      if (validation_token) {
        let user_foot = await footPrintUser(validation_token);
        logger.info(user_foot);
        if (user_foot?.user_auth?.fp_id) {
          fp_id = user_foot?.user_auth?.fp_id;
        }
      } else {
        hashed_password = bcrypt.hashSync(password, salt);
      }

      const newUser = {
        email: email,
        password: hashed_password,
        user_name: user_name,
        wallets: [],
        logo: 'uploads/' + filename,
        company,
        footId: fp_id,
      };
      const user = new UserModel(newUser);
      await user.save();
      await BalanceController.createBalancesPerUser(user._id);
      const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
      //creamos wallets defaults :
      await ensureWalletNetworkUsersForUser(user._id);

      res.json({
        response: {
          _id: user._id,
          user_name,
          email,
          token,
          logo: 'uploads/' + filename,
          company,
          apiKey: user.apiKey,
          verify: user.verify,
          footId: user.footId,
          admin: user.admin ? user.admin : false,
        },
        status: 'success',
      });
    } catch (error) {
      console.log(error);
      handleHttpError(error, res);
    }
  },
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generar y guardar el token de restablecimiento
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();
      console.log(user.email, 'token', resetToken);
      // Enviar email con el token de restablecimiento

      const resetUrl = `${process.env.URL_FRONT}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);
      res.status(200).json(response('Password reset email sent'));
    } catch (error) {
      console.log(error);
      res.status(500).json(response('Error on forgot password', 'error'));
    }
  },

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: 'Password reset token is invalid or has expired' });
      }
      // // Validar la contraseña
      // const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      // if (!passwordRegex.test(password)) {
      //     return res.status(200).json(response('Password must be at least 8 characters long and contain at least one special character.', "error"));
      // }
      // Actualizar la contraseña
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(password, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Error on reset password', error });
    }
  },

  async confirmVerificationSubmittedByEmail(req, res) {
    try {
      const validationToken = req.params.validationToken;
      const isKYC = req.query.isKYC === 'true';

      if (!validationToken) {
        return res
          .status(400)
          .json({ message: 'Validation token is required' });
      }

      const f_user = await footPrintUser(validationToken);
      const fp_id = f_user?.user_auth?.fp_id;

      if (!fp_id) {
        return res.status(404).json({ message: 'Footprint user not found' });
      }

      const fpEmailRes = await footPrintUserEmail(fp_id, isKYC);
      const fp_email = fpEmailRes['id.email'];

      await sendConfirmVerificationSubmittedEmail(fp_email);

      res
        .status(200)
        .json(
          response(
            `Confirm Verification Submission sent by email to ${fp_email}`
          )
        );
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Error on confirm verification submit by email',
        error,
      });
    }
  },
};
