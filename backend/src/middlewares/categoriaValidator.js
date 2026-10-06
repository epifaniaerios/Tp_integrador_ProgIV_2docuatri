const { body, param, validationResult } = require('express-validator');

const validarCategoria = [
  body('nombre')
    .notEmpty().withMessage('El nombre de la categoría es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('descripcion')
    .optional()
    .isLength({ max: 255 }).withMessage('La descripción no puede superar los 255 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', errores: errors.array() });
    }
    next();
  },
];

const validarIdParam = [
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', errores: errors.array() });
    }
    next();
  },
];

module.exports = {
  validarCategoria,
  validarIdParam,
};