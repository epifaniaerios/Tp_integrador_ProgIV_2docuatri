import express from 'express';
import * as avatarController from '../controllers/avatarController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { subirAvatar } from '../config/upload.js';

const router = express.Router();

// Cualquier usuario autenticado puede ver y cambiar su propio avatar
router.get('/', verificarToken, avatarController.obtener);
router.post('/', verificarToken, subirAvatar, avatarController.guardar);

export default router;