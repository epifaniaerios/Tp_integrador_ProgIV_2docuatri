import { body, validationResult } from 'express-validator';

export const validarArticulo = [
  body('id_area').isInt({ min: 1 }).withMessage('id_area es obligatorio y debe ser numérico'),
  body('id_categoria').isInt({ min: 1 }).withMessage('id_categoria es obligatorio y debe ser numérico'),
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ max: 250 }).withMessage('La descripción no puede superar los 250 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', errores: errors.array() });
    }
    next();
  },
];