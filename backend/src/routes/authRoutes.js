const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validarLogin } = require('../middlewares/validatorMiddleware');

router.post('/login', validarLogin, authController.login);

module.exports = router;