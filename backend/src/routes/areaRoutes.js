import express from 'express';
import * as areaController from '../controllers/areaController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Lectura: cualquier usuario autenticado
router.get('/', verificarToken, areaController.listar);

export default router;