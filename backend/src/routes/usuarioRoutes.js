import express from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddleware.js';
import { uploadAvatar } from '../middlewares/uploadMiddleware.js';
import { ROLES } from '../config/constantes.js';

const router = express.Router();

// Solo el director necesita esta lista (para asignar incidencias)
router.get(
  '/sistemas',
  verificarToken,
  autorizarRoles(ROLES.DIRECTOR_SISTEMAS),
  usuarioController.listarEmpleadosSistemas
);

router.patch(
  '/avatar',
  verificarToken,
  uploadAvatar.single('avatar'),
  usuarioController.cambiarAvatar
);

router.patch(
  '/cambiar-clave',
  verificarToken,
  usuarioController.cambiarContrasenia
);

export default router;
