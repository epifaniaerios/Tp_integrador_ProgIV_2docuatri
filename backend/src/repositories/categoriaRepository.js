const pool = require('../config/db');

const listarTodas = async () => {
  const query = 'SELECT id_categoria, descripcion FROM categorias WHERE activo = 1 ORDER BY descripcion ASC;';
  const result = await pool.query(query);
  return result.rows;
};

const buscarPorId = async (id) => {
  const query = 'SELECT id_categoria, descripcion FROM categorias WHERE id_categoria = $1 AND activo = 1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async ({ descripcion }) => {
  const query = `
    INSERT INTO categorias (descripcion, activo)
    VALUES ($1, 1)
    RETURNING id_categoria, descripcion;
  `;
  const result = await pool.query(query, [descripcion]);
  return result.rows[0];
};

const actualizar = async (id, { descripcion }) => {
  const query = `
    UPDATE categorias
    SET descripcion = $1
    WHERE id_categoria = $2 AND activo = 1
    RETURNING id_categoria, descripcion;
  `;
  const result = await pool.query(query, [descripcion, id]);
  return result.rows[0];
};

const eliminarLogico = async (id) => {
  const query = 'UPDATE categorias SET activo = 0 WHERE id_categoria = $1 RETURNING id_categoria;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  listarTodas,
  buscarPorId,
  crear,
  actualizar,
  eliminarLogico,
};