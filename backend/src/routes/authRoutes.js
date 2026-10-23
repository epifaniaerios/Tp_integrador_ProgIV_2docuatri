import express from 'express';
import * as authController from '../controllers/authController.js';
import { validarLogin } from '../middlewares/validatorMiddleware.js';

const router = express.Router();

router.post('/login', validarLogin, authController.login);

export default router;