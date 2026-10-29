import pool from '../config/db.js';
import { ROLES } from '../config/constantes.js';

export const buscarPorUsuarioYClave = async (usuario, contrasenia) => {
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

// En esta base el campo "usuario" es el correo electrónico
export const buscarCorreoPorId = async (id_usuario) => {
  const result = await pool.query(
    'SELECT usuario FROM usuarios WHERE id_usuario = $1 AND activo = 1',
    [id_usuario]
  );
  return result.rows[0]?.usuario;
};

export const listarEmpleadosSistemas = async () => {
  const result = await pool.query(
    `SELECT id_usuario, nombres, apellidos, usuario
     FROM usuarios
     WHERE rol = $1 AND activo = 1
     ORDER BY apellidos, nombres`,
    [ROLES.EMPLEADO_SISTEMAS]
  );
  return result.rows;
};