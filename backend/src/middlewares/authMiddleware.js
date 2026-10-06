const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
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

const esAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({
      status: 'ERROR',
      message: 'Acceso denegado: Se requieren permisos de administrador',
    });
  }
};

module.exports = {
  verificarToken,
  esAdmin,
};