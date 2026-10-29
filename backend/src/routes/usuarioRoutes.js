import express from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../config/constantes.js';

const router = express.Router();

// Solo el director necesita esta lista (para asignar incidencias)
router.get(
  '/sistemas',
  verificarToken,
  autorizarRoles(ROLES.DIRECTOR_SISTEMAS),
  usuarioController.listarEmpleadosSistemas
);

export default router;