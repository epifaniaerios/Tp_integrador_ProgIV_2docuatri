const express = require('express');
const router = express.Router();
const incidenciaController = require('../controllers/incidenciaController');
const { validarIncidencia, validarEstado } = require('../middlewares/incidenciaValidator');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

// Ver incidencias (Usuarios autenticados)
router.get('/', verificarToken, incidenciaController.listar);
router.get('/:id', verificarToken, incidenciaController.obtenerPorId);

// Registrar nueva incidencia (Usuarios autenticados)
router.post('/', verificarToken, validarIncidencia, incidenciaController.crear);

// Cambiar estado de una incidencia (Usuarios autenticados)
router.patch('/:id/estado', verificarToken, validarEstado, incidenciaController.cambiarEstado);

// Eliminar incidencia (Sólo Administradores)
router.delete('/:id', [verificarToken, esAdmin], incidenciaController.eliminar);

module.exports = router;