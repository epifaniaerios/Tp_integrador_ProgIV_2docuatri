const pool = require('../config/db');

// Función auxiliar para convertir la prioridad de texto (del frontend) a número (para la BD)
const mapPrioridad = (prioridad) => {
  if (prioridad === 'Alta' || prioridad === 'ALTA') return 1;
  if (prioridad === 'Media' || prioridad === 'MEDIA') return 2;
  return 3; // Baja
};

const listarTodas = async () => {
  const query = `
    SELECT 
      i.id_incidencia, 
      i.descripcion_pedido AS titulo, 
      c.descripcion AS categoria,
      CASE i.prioridad 
        WHEN 1 THEN 'ALTA' 
        WHEN 2 THEN 'MEDIA' 
        ELSE 'BAJA' 
      END AS prioridad, 
      'PENDIENTE' AS estado, 
      u.usuario AS creado_por
    FROM incidencias i
    LEFT JOIN categorias c ON i.id_articulo = c.id_categoria
    LEFT JOIN usuarios u ON i.creado_por = u.id_usuario
    ORDER BY i.prioridad ASC, i.creado DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

const buscarPorId = async (id) => {
  const query = 'SELECT * FROM incidencias WHERE id_incidencia = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async ({ titulo, descripcion, prioridad, id_categoria, id_usuario }) => {
  const prioridadInt = mapPrioridad(prioridad);
  // Guardamos el título y la descripción juntos en la columna "descripcion_pedido"
  const descripcionCompleta = titulo + ' - ' + descripcion;
  
  const query = `
    INSERT INTO incidencias (id_articulo, id_estado, creado_por, prioridad, descripcion_pedido)
    VALUES ($1, 1, $2, $3, $4)
    RETURNING id_incidencia;
  `;
  const result = await pool.query(query, [id_categoria, id_usuario, prioridadInt, descripcionCompleta]);
  return result.rows[0];
};

const cambiarEstado = async (id, estado) => {
  // Asumimos que id_estado = 2 es "En Proceso"
  const query = 'UPDATE incidencias SET id_estado = 2 WHERE id_incidencia = $1 RETURNING *;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const eliminarLogico = async (id) => {
  // Como la tabla no tiene columna "activo", simulamos el soft delete cambiando el estado a 4 (Cancelado/Eliminado)
  const query = 'UPDATE incidencias SET id_estado = 4 WHERE id_incidencia = $1 RETURNING id_incidencia;';
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