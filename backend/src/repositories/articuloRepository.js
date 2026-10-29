import pool from '../config/db.js';

const SELECT_BASE = `
  SELECT
    a.id_articulo,
    a.descripcion,
    a.id_area,
    ar.descripcion AS area,
    a.id_categoria,
    c.descripcion AS categoria
  FROM articulos a
  JOIN areas ar ON ar.id_area = a.id_area
  JOIN categorias c ON c.id_categoria = a.id_categoria
`;

export const listarTodos = async () => {
  const result = await pool.query(`${SELECT_BASE} WHERE a.activo = 1 ORDER BY a.descripcion ASC`);
  return result.rows;
};

export const buscarPorId = async (id) => {
  const result = await pool.query(`${SELECT_BASE} WHERE a.id_articulo = $1 AND a.activo = 1`, [id]);
  return result.rows[0];
};

export const areaActiva = async (id_area) => {
  const result = await pool.query('SELECT id_area FROM areas WHERE id_area = $1 AND activo = 1', [id_area]);
  return result.rows[0];
};

export const categoriaActiva = async (id_categoria) => {
  const result = await pool.query(
    'SELECT id_categoria FROM categorias WHERE id_categoria = $1 AND activo = 1',
    [id_categoria]
  );
  return result.rows[0];
};

export const crear = async ({ id_area, id_categoria, descripcion }) => {
  const result = await pool.query(
    `INSERT INTO articulos (id_area, id_categoria, descripcion, activo)
     VALUES ($1, $2, $3, 1)
     RETURNING id_articulo`,
    [id_area, id_categoria, descripcion]
  );
  return buscarPorId(result.rows[0].id_articulo);
};

export const actualizar = async (id, { id_area, id_categoria, descripcion }) => {
  await pool.query(
    `UPDATE articulos
     SET id_area = $1, id_categoria = $2, descripcion = $3
     WHERE id_articulo = $4 AND activo = 1`,
    [id_area, id_categoria, descripcion, id]
  );
  return buscarPorId(id);
};

export const eliminarLogico = async (id) => {
  const result = await pool.query(
    'UPDATE articulos SET activo = 0 WHERE id_articulo = $1 RETURNING id_articulo',
    [id]
  );
  return result.rows[0];
};