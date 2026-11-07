mport express from 'express';
import * as incidenciaController from '../controllers/incidenciaController.js';
import {
  validarId,
  validarIncidencia,
  validarAsignacion,
  validarResolucion,
} from '../middlewares/incidenciaValidator.js';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../config/constantes.js';

const router = express.Router();

router.get('/', verificarToken, incidenciaController.listar);
router.get('/:id', verificarToken, validarId, incidenciaController.obtenerPorId);

router.post(
  '/',
  verificarToken,
  autorizarRoles(ROLES.EMPLEADO_MUNICIPAL, ROLES.EMPLEADO_SISTEMAS, ROLES.DIRECTOR_SISTEMAS),
  validarIncidencia,
  incidenciaController.crear
);

router.patch(
  '/:id/cancelar',
  verificarToken,
  autorizarRoles(ROLES.EMPLEADO_MUNICIPAL, ROLES.DIRECTOR_SISTEMAS),
  validarId,
  incidenciaController.cancelar
);

router.patch(
  '/:id/asignar',
  verificarToken,
  autorizarRoles(ROLES.DIRECTOR_SISTEMAS),
  validarId,
  validarAsignacion,
  incidenciaController.asignar
);

router.patch(
  '/:id/finalizar',
  verificarToken,
  autorizarRoles(ROLES.EMPLEADO_SISTEMAS),
  validarId,
  validarResolucion,
  incidenciaController.finalizar
);

router.patch(
  '/:id/prioridad',
  verificarToken,
  autorizarRoles(ROLES.EMPLEADO_SISTEMAS, ROLES.DIRECTOR_SISTEMAS),
  incidenciaController.cambiarPrioridad
);

export default router;
