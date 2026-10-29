import pool from '../config/db.js';
import { ESTADOS } from '../config/constantes.js';

// Total de incidencias por estado (incluye estados con 0 incidencias)
export const totalesPorEstado = async () => {
  const result = await pool.query(`
    SELECT e.id_estado, e.descripcion AS estado, COUNT(i.id_incidencia)::int AS total
    FROM estados e
    LEFT JOIN incidencias i ON i.id_estado = e.id_estado
    WHERE e.activo = 1
    GROUP BY e.id_estado, e.descripcion
    ORDER BY e.id_estado
  `);
  return result.rows;
};

// Total de incidencias creadas por día (últimos 30 días con actividad)
export const totalesPorFecha = async () => {
  const result = await pool.query(`
    SELECT to_char(i.creado, 'YYYY-MM-DD') AS fecha, COUNT(*)::int AS total
    FROM incidencias i
    GROUP BY fecha
    ORDER BY fecha DESC
    LIMIT 30
  `);
  return result.rows;
};

// Total por prioridad (1 = alta, 2 = media, 3 = baja)
export const totalesPorPrioridad = async () => {
  const result = await pool.query(`
    SELECT
      CASE i.prioridad WHEN 1 THEN 'Alta' WHEN 2 THEN 'Media' ELSE 'Baja' END AS prioridad,
      COUNT(*)::int AS total
    FROM incidencias i
    GROUP BY i.prioridad
    ORDER BY i.prioridad
  `);
  return result.rows;
};

// Incidencias prioritarias: prioridad alta que todavía no están resueltas ni canceladas
export const prioritarias = async () => {
  const result = await pool.query(
    `SELECT
       i.id_incidencia,
       a.descripcion AS articulo,
       e.descripcion AS estado,
       to_char(i.creado, 'DD/MM/YYYY HH24:MI') AS creado,
       i.descripcion_pedido
     FROM incidencias i
     JOIN articulos a ON a.id_articulo = i.id_articulo
     JOIN estados e ON e.id_estado = i.id_estado
     WHERE i.prioridad = 1 AND i.id_estado IN ($1, $2)
     ORDER BY i.creado DESC`,
    [ESTADOS.PENDIENTE, ESTADOS.EN_PROCESO]
  );
  return result.rows;
};