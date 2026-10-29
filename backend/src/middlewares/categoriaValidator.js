import { body, param, validationResult } from 'express-validator';

export const validarCategoria = [
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción de la categoría es obligatoria')
    .isLength({ min: 3, max: 255 }).withMessage('La descripción debe tener entre 3 y 255 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', errores: errors.array() });
    }
    next();
  },
];

export const validarIdParam = [
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', errores: errors.array() });
    }
    next();
  },
];