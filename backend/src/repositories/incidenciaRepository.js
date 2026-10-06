const pool = require('../config/db');

const listarTodas = async () => {
  const query = `
    SELECT 
      i.id_incidencia, i.titulo, i.descripcion, i.prioridad, i.estado, i.fecha_creacion,
      c.nombre AS categoria,
      u.usuario AS creado_por
    FROM incidencias i
    JOIN categorias c ON i.id_categoria = c.id_categoria
    JOIN usuarios u ON i.id_usuario = u.id_usuario
    WHERE i.activo = 1
    ORDER BY 
      CASE i.prioridad 
        WHEN 'ALTA' THEN 1 
        WHEN 'MEDIA' THEN 2 
        WHEN 'BAJA' THEN 3 
      END, i.fecha_creacion DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

const buscarPorId = async (id) => {
  const query = `
    SELECT i.*, c.nombre AS categoria, u.usuario AS creado_por
    FROM incidencias i
    JOIN categorias c ON i.id_categoria = c.id_categoria
    JOIN usuarios u ON i.id_usuario = u.id_usuario
    WHERE i.id_incidencia = $1 AND i.activo = 1;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async ({ titulo, descripcion, prioridad, id_categoria, id_usuario }) => {
  const query = `
    INSERT INTO incidencias (titulo, descripcion, prioridad, estado, id_categoria, id_usuario, activo)
    VALUES ($1, $2, $3, 'PENDIENTE', $4, $5, 1)
    RETURNING *;
  `;
  const result = await pool.query(query, [titulo, descripcion, prioridad, id_categoria, id_usuario]);
  return result.rows[0];
};

const cambiarEstado = async (id, estado) => {
  const query = `
    UPDATE incidencias
    SET estado = $1
    WHERE id_incidencia = $2 AND activo = 1
    RETURNING *;
  `;
  const result = await pool.query(query, [estado, id]);
  return result.rows[0];
};

const eliminarLogico = async (id) => {
  const query = 'UPDATE incidencias SET activo = 0 WHERE id_incidencia = $1 RETURNING id_incidencia;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  listarTodas,
  buscarPorId,
  crear,
  cambiarEstado,
  eliminarLogico,
};