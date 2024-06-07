// routes/authRoutes.js
const express = require('express');
const path = require('path');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Merchant = require('../models/Merchant');
const User = require("../models/user.model");
const authController = require('../controllers/auth.controller');
const logRequest = require('../middleware/logRequest');
const multer = require('multer');
const router = express.Router();
// Registro
// router.post(
//     '/register',
//     [
//         check('name', 'Name is required').not().isEmpty(),
//         check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
//     ],
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { name, description, image, url, password } = req.body;

//         try {
//             let merchant = await Merchant.findOne({ name });
//             if (merchant) {
//                 return res.status(400).json({ msg: 'Merchant already exists' });
//             }

//             merchant = new Merchant({
//                 name,
//                 description,
//                 image,
//                 url,
//                 password,
//             });

//             const salt = await bcrypt.genSalt(10);
//             merchant.password = await bcrypt.hash(password, salt);

//             await merchant.save();

//             const merchantWithoutPassword = {
//                 id: merchant.id,
//                 name: merchant.name,
//                 description: merchant.description,
//                 image: merchant.image,
//                 url: merchant.url,
//             };

//             const payload = {
//                 merchant: {
//                     id: merchant.id,
//                 },
//             };

//             jwt.sign(
//                 payload,
//                 process.env.JWT_SECRET,
//                 { expiresIn: 360000 },
//                 (err, token) => {
//                     if (err) throw err;
//                     res.json({ token, merchant: merchantWithoutPassword });
//                 }
//             );
//         } catch (err) {
//             console.error(err.message);
//             res.status(500).send('Server error');
//         }
//     }
// );

// // Login
// router.post(
//     '/login',
//     [
//         check('name', 'Name is required').not().isEmpty(),
//         check('password', 'Password is required').exists(),
//     ],
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { name, password } = req.body;

//         try {
//             let merchant = await Merchant.findOne({ name });
//             if (!merchant) {
//                 return res.status(400).json({ msg: 'Invalid credentials' });
//             }

//             const isMatch = await bcrypt.compare(password, merchant.password);
//             if (!isMatch) {
//                 return res.status(400).json({ msg: 'Invalid credentials' });
//             }

//             // Eliminar la contraseña del objeto de comerciante antes de devolverlo
//             const merchantWithoutPassword = {
//                 id: merchant.id,
//                 name: merchant.name,
//                 description: merchant.description,
//                 image: merchant.image,
//                 url: merchant.url,
//             };

//             const payload = {
//                 merchant: merchantWithoutPassword,
//             };

//             jwt.sign(
//                 payload,
//                 process.env.JWT_SECRET,
//                 { expiresIn: 360000 },
//                 (err, token) => {
//                     if (err) throw err;
//                     // Devolver el token JWT junto con los detalles del comerciante sin la contraseña
//                     res.json({ token, merchant: merchantWithoutPassword });
//                 }
//             );
//         } catch (err) {
//             console.error(err.message);
//             res.status(500).send('Server error');
//         }
//     }
// );
// Ruta para manejar la subida de la imagen


// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


router.post('/login', logRequest, authController.login);
router.post('/register', upload.single('logo'), logRequest, authController.register);


module.exports = router;
