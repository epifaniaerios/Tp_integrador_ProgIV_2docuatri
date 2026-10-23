import express from 'express';
import * as categoriaController from '../controllers/categoriaController.js';
import { validarCategoria, validarIdParam } from '../middlewares/categoriaValidator.js';
import { verificarToken, esAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Lectura de categorías (Usuarios autenticados)
router.get('/', verificarToken, categoriaController.listar);
router.get('/:id', [verificarToken, validarIdParam], categoriaController.obtenerPorId);

// Modificaciones y gestión (Sólo Administradores)
router.post('/', [verificarToken, esAdmin, validarCategoria], categoriaController.crear);
router.put('/:id', [verificarToken, esAdmin, validarIdParam, validarCategoria], categoriaController.actualizar);
router.delete('/:id', [verificarToken, esAdmin, validarIdParam], categoriaController.eliminar);

export default router;