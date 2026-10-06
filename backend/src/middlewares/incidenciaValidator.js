const { body, param, validationResult } = require('express-validator');

const validarIncidencia = [
  body('titulo')
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ min: 5, max: 150 }).withMessage('El título debe contener entre 5 y 150 caracteres'),
  body('descripcion')
    .notEmpty().withMessage('La descripción es obligatoria'),
  body('prioridad')
    .optional()
    .isIn(['BAJA', 'MEDIA', 'ALTA']).withMessage('Prioridad no válida (BAJA, MEDIA, ALTA)'),
  body('id_categoria')
    .isInt({ min: 1 }).withMessage('Debe especificar una categoría válida'),
  body('id_usuario')
    .isInt({ min: 1 }).withMessage('Debe especificar el ID del usuario reportante'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', errores: errors.array() });
    }
    next();
  },
];

const validarEstado = [
  body('estado')
    .isIn(['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CANCELADO'])
    .withMessage('Estado no válido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', errores: errors.array() });
    }
    next();
  },
];

module.exports = {
  validarIncidencia,
  validarEstado,
};