const pool = require('../config/db');

const buscarPorUsuarioYClave = async (usuario, contrasenia) => {
  const query = `
    SELECT id_usuario, nombres, apellidos, usuario, rol, id_area, activo
    FROM usuarios
    WHERE usuario = $1
      AND contrasenia = encode(digest($2, 'sha256'), 'hex')
      AND activo = 1;
  `;
  const result = await pool.query(query, [usuario, contrasenia]);
  return result.rows[0];
};

module.exports = {
  buscarPorUsuarioYClave,
};