const pool = require('../config/db');

const listarTodas = async () => {
  const query = 'SELECT id_categoria, nombre, descripcion FROM categorias WHERE activo = 1 ORDER BY nombre ASC;';
  const result = await pool.query(query);
  return result.rows;
};

const buscarPorId = async (id) => {
  const query = 'SELECT id_categoria, nombre, descripcion FROM categorias WHERE id_categoria = $1 AND activo = 1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async ({ nombre, descripcion }) => {
  const query = `
    INSERT INTO categorias (nombre, descripcion, activo)
    VALUES ($1, $2, 1)
    RETURNING id_categoria, nombre, descripcion;
  `;
  const result = await pool.query(query, [nombre, descripcion]);
  return result.rows[0];
};

const actualizar = async (id, { nombre, descripcion }) => {
  const query = `
    UPDATE categorias
    SET nombre = $1, descripcion = $2
    WHERE id_categoria = $3 AND activo = 1
    RETURNING id_categoria, nombre, descripcion;
  `;
  const result = await pool.query(query, [nombre, descripcion, id]);
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