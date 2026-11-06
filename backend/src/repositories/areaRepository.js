import pool from '../config/db.js';

export const listarActivas = async () => {
  const result = await pool.query(
    'SELECT id_area, descripcion FROM areas WHERE activo = 1 ORDER BY descripcion ASC'
  );
  return result.rows;
};