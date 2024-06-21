const logger = require('node-color-log');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { DebitCardService } = require('../services/debit-cards.service');
const UserModel = require('../models/user.model');
const { JWT_SECRET } = require('../config');
const { handleHttpError, response } = require('../utils/index.js');

const secretKey = JWT_SECRET;

module.exports = {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findOne({ email: email });

            if (!user) {
                res.status(200).send({ response: 'Invalid credentials.', status: "error" });

                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                res.status(200).send({ response: 'Invalid credentials.', status: "error" });
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
            };

            res.send({ response: response, status: "success" });
        } catch (error) {
            handleHttpError(error, res);
        }
    },

    async register(req, res) {
        try {
            const { user_name, email, password, company } = req.body;
            // Obtener el nombre del archivo subido
            const filename = (req.file?.filename) ? req.file?.filename : "default.jpg";
            // console.log(filename)

            const alreadyExists = await UserModel.findOne({ email: email });

            if (alreadyExists) {
                handleHttpError(new Error('Email already taken.'), res, 200);
                return;
            }
            // Validar la contraseña
            const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(200).json(response('Password must be at least 8 characters long and contain at least one special character.', "error"));
            }
            // Validar el email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json(response('Invalid email format.', "error"));
            }

            logger.info({ email, password, user_name });

            const salt = bcrypt.genSaltSync(10);
            const hashed_password = bcrypt.hashSync(password, salt);
            const newUser = {
                email: email,
                password: hashed_password,
                user_name: user_name,
                wallets: [],
                logo: "uploads/" + filename,
                company
            };
            const user = new UserModel(newUser);
            await user.save();

            await DebitCardService.create({
                userId: user._id.toString(),
                rampUserId: '',
                userName: user_name,
                userEmail: email,
                card1: JSON.stringify({
                    cardNumber: '',
                    cardName: '',
                    cardExpiry: '',
                    cardCVV: '',
                }),
            });

            const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });

            res.json({ response: { _id: user._id, user_name, email, token, logo: "uploads/" + filename, company, apiKey: user.apiKey }, status: "success" });
        } catch (error) {
            console.log(error);
            handleHttpError(error, res);
        }
    },
};
