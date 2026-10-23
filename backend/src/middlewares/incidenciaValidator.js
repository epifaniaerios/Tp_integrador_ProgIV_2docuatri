import { body, param, validationResult } from 'express-validator';

const manejarErrores = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      status: 'ERROR',
      message: 'Error de validación',
      errores: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
};

export const validarId = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un número entero positivo'),
  manejarErrores,
];

export const validarIncidencia = [
  body('id_articulo').isInt({ min: 1 }).withMessage('id_articulo es obligatorio y debe ser numérico'),
  body('descripcion_pedido')
    .trim()
    .notEmpty().withMessage('La descripción del pedido es obligatoria')
    .isLength({ max: 250 }).withMessage('La descripción no puede superar los 250 caracteres'),
  body('prioridad')
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage('La prioridad debe ser 1 (alta), 2 (media) o 3 (baja)'),
  manejarErrores,
];

export const validarAsignacion = [
  body('asignado_a').isInt({ min: 1 }).withMessage('asignado_a es obligatorio y debe ser numérico'),
  manejarErrores,
];

export const validarResolucion = [
  body('descripcion_resolucion')
    .trim()
    .notEmpty().withMessage('La descripción de la resolución es obligatoria')
    .isLength({ max: 250 }).withMessage('La descripción no puede superar los 250 caracteres'),
  manejarErrores,
];