const usuarioRepository = require('../repositories/usuarioRepository');
const jwt = require('jsonwebtoken');

const login = async (usuario, contrasenia) => {
  const user = await usuarioRepository.buscarPorUsuarioYClave(usuario, contrasenia);

  if (!user) {
    const error = new Error('Credenciales inválidas o usuario inactivo');
    error.status = 401;
    throw error;
  }

  // Generación del token JWT
  const token = jwt.sign(
    {
      id_usuario: user.id_usuario,
      usuario: user.usuario,
      rol: user.rol,
      id_area: user.id_area,
    },
    process.env.JWT_SECRET,
    { expiresIn: '4h' }
  );

  return {
    token,
    usuario: {
      id: user.id_usuario,
      nombre: `${user.nombres} ${user.apellidos}`,
      usuario: user.usuario,
      rol: user.rol,
      id_area: user.id_area,
    },
  };
};

module.exports = {
  login,
};