import { body, validationResult } from 'express-validator';

export const validarLogin = [
  body('usuario')
    .notEmpty().withMessage('El usuario/correo es requerido')
    .isEmail().withMessage('Debe ingresar un correo electrónico válido'),
  body('contrasenia')
    .notEmpty().withMessage('La contraseña es requerida'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'ERROR', errores: errors.array() });
    }
    next();
  },
];