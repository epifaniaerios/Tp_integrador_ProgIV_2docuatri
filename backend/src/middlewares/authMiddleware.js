import jwt from 'jsonwebtoken';
import { ROLES } from '../config/constantes.js';

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrae el token tras 'Bearer'

  if (!token) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Acceso denegado: Token de autenticación no proporcionado',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Adjunta el payload (id_usuario, rol, id_area) a req
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'ERROR',
      message: 'Token no válido o expirado',
    });
  }
};

// Uso: autorizarRoles(ROLES.DIRECTOR_SISTEMAS, ROLES.EMPLEADO_SISTEMAS)
// Va siempre DESPUÉS de verificarToken.
export const autorizarRoles = (...rolesPermitidos) => (req, res, next) => {
  if (req.usuario && rolesPermitidos.includes(req.usuario.rol)) {
    return next();
  }
  return res.status(403).json({
    status: 'ERROR',
    message: 'Acceso denegado: no tenés permisos para esta acción',
  });
};

// Se mantiene por compatibilidad: "admin" = Director del área de Sistemas
export const esAdmin = autorizarRoles(ROLES.DIRECTOR_SISTEMAS);