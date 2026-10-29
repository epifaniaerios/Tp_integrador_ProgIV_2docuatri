import express from 'express';
import * as articuloController from '../controllers/articuloController.js';
import { validarArticulo } from '../middlewares/articuloValidator.js';
import { validarIdParam } from '../middlewares/categoriaValidator.js';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../config/constantes.js';

const router = express.Router();

// Lectura: cualquier usuario autenticado (el empleado municipal lista artículos para crear incidencias)
router.get('/', verificarToken, articuloController.listar);
router.get('/:id', [verificarToken, validarIdParam], articuloController.obtenerPorId);

// Alta, edición y baja: empleado del área de Sistemas
const soloSistemas = autorizarRoles(ROLES.EMPLEADO_SISTEMAS);
router.post('/', [verificarToken, soloSistemas, validarArticulo], articuloController.crear);
router.put('/:id', [verificarToken, soloSistemas, validarIdParam, validarArticulo], articuloController.actualizar);
router.delete('/:id', [verificarToken, soloSistemas, validarIdParam], articuloController.eliminar);

export default router;