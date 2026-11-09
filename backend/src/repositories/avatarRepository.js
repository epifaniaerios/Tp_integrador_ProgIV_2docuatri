import pool from '../config/db.js';

export const obtener = async (id_usuario) => {
  const result = await pool.query(
    'SELECT avatar FROM usuarios WHERE id_usuario = $1 AND activo = 1',
    [id_usuario]
  );
  return result.rows[0]?.avatar;
};

export const actualizar = async (id_usuario, ruta) => {
  await pool.query('UPDATE usuarios SET avatar = $1 WHERE id_usuario = $2', [ruta, id_usuario]);
};