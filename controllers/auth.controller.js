const logger = require('node-color-log');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { DebitCardService } = require('../services/debit-cards.service');
const UserModel = require('../models/user.model');
const { JWT_SECRET } = require('../config');
const { handleHttpError } = require('../utils');

const secretKey = JWT_SECRET;

module.exports = {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findOne({ email: email });

            if (!user) {
                res.status(401).send({ error: 'Invalid credentials.' });
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                res.status(401).send({ error: 'Invalid credentials.' });
                return;
            }

            const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '3h' });

            const response = {
                _id: user._id,
                user_name: user.user_name,
                email: user.email,
                token,
            };

            res.send(response);
        } catch (error) {
            handleHttpError(error, res);
        }
    },

    async register(req, res) {
        // try {
            const { user_name, email, password, company } = req.body;
            // Obtener el nombre del archivo subido
            const filename = req.file.filename;
            // console.log(filename)

            const alreadyExists = await UserModel.findOne({ email: email });

            if (alreadyExists) {
                handleHttpError(new Error('Email already taken.'), res, 409);
                return;
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

            res.json({ _id: user._id, user_name, email, token, logo: "uploads/" + filename, company });
        // } catch (error) {
        //     console.log(error);
        //     handleHttpError(error, res);
        // }
    },
};
