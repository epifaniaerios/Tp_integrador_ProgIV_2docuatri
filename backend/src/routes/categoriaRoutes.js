const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { validarCategoria, validarIdParam } = require('../middlewares/categoriaValidator');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

// Lectura de categorías (Usuarios autenticados)
router.get('/', verificarToken, categoriaController.listar);
router.get('/:id', [verificarToken, validarIdParam], categoriaController.obtenerPorId);

// Modificaciones y gestión (Sólo Administradores)
router.post('/', [verificarToken, esAdmin, validarCategoria], categoriaController.crear);
router.put('/:id', [verificarToken, esAdmin, validarIdParam, validarCategoria], categoriaController.actualizar);
router.delete('/:id', [verificarToken, esAdmin, validarIdParam], categoriaController.eliminar);

module.exports = router;