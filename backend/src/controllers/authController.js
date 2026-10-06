const authService = require('../services/authService');

const login = async (req, res) => {
  try {
    const { usuario, contrasenia } = req.body;
    const resultado = await authService.login(usuario, contrasenia);

    return res.status(200).json({
      status: 'OK',
      message: 'Inicio de sesión exitoso',
      data: resultado,
    });
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      status: 'ERROR',
      message: error.message || 'Error interno del servidor',
    });
  }
};

module.exports = {
  login,
};