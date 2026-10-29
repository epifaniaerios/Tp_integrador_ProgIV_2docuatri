import express from 'express';
import * as categoriaController from '../controllers/categoriaController.js';
import { validarCategoria, validarIdParam } from '../middlewares/categoriaValidator.js';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../config/constantes.js';

const router = express.Router();

// Lectura: cualquier usuario autenticado
router.get('/', verificarToken, categoriaController.listar);
router.get('/:id', [verificarToken, validarIdParam], categoriaController.obtenerPorId);

// Alta, edición y baja: empleado del área de Sistemas
const soloSistemas = autorizarRoles(ROLES.EMPLEADO_SISTEMAS);
router.post('/', [verificarToken, soloSistemas, validarCategoria], categoriaController.crear);
router.put('/:id', [verificarToken, soloSistemas, validarIdParam, validarCategoria], categoriaController.actualizar);
router.delete('/:id', [verificarToken, soloSistemas, validarIdParam], categoriaController.eliminar);

export default router;