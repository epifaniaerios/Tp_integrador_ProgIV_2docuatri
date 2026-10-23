import pool from '../config/db.js';
import { ROLES, ESTADOS } from '../config/constantes.js';

// asignado_a es NOT NULL en la base, así que al crear se guarda un valor provisorio.
// Solo se considera "asignada" una incidencia En Proceso o Resuelta; en los demás
// estados se muestra sin asignar.
const SELECT_BASE = `
  SELECT
    i.id_incidencia,
    i.id_articulo,
    a.descripcion AS articulo,
    c.descripcion AS categoria,
    i.id_estado,
    e.descripcion AS estado,
    i.creado_por,
    uc.nombres || ' ' || uc.apellidos AS creado_por_nombre,
    CASE WHEN i.id_estado IN (${ESTADOS.EN_PROCESO}, ${ESTADOS.RESUELTA})
         THEN i.asignado_a END AS asignado_a,
    CASE WHEN i.id_estado IN (${ESTADOS.EN_PROCESO}, ${ESTADOS.RESUELTA})
         THEN ua.nombres || ' ' || ua.apellidos END AS asignado_a_nombre,
    i.creado,
    i.prioridad,
    i.descripcion_pedido,
    i.descripcion_resolucion
  FROM incidencias i
  JOIN articulos a ON a.id_articulo = i.id_articulo
  JOIN categorias c ON c.id_categoria = a.id_categoria
  JOIN estados e ON e.id_estado = i.id_estado
  JOIN usuarios uc ON uc.id_usuario = i.creado_por
  LEFT JOIN usuarios ua ON ua.id_usuario = i.asignado_a
`;

export const listar = async ({ rol, id_usuario }) => {
  let where = '';
  const params = [];

  if (rol === ROLES.EMPLEADO_MUNICIPAL) {
    where = 'WHERE i.creado_por = $1';
    params.push(id_usuario);
  } else if (rol === ROLES.EMPLEADO_SISTEMAS) {
    where = `WHERE i.asignado_a = $1 AND i.id_estado IN (${ESTADOS.EN_PROCESO}, ${ESTADOS.RESUELTA})`;
    params.push(id_usuario);
  }

  // prioridad 1 = alta, así que ASC deja primero las más urgentes
  const query = `${SELECT_BASE} ${where} ORDER BY i.prioridad ASC, i.creado DESC`;
  const result = await pool.query(query, params);
  return result.rows;
};

export const buscarPorId = async (id) => {
  const result = await pool.query(`${SELECT_BASE} WHERE i.id_incidencia = $1`, [id]);
  return result.rows[0];
};

export const articuloActivo = async (id_articulo) => {
  const result = await pool.query(
    'SELECT id_articulo FROM articulos WHERE id_articulo = $1 AND activo = 1',
    [id_articulo]
  );
  return result.rows[0];
};

export const buscarEmpleadoSistemas = async (id_usuario) => {
  const result = await pool.query(
    'SELECT id_usuario FROM usuarios WHERE id_usuario = $1 AND rol = $2 AND activo = 1',
    [id_usuario, ROLES.EMPLEADO_SISTEMAS]
  );
  return result.rows[0];
};

export const crear = async ({ id_articulo, descripcion_pedido, prioridad, creado_por }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // asignado_a lleva el mismo valor que creado_por (provisorio hasta que el director asigne)
    const nueva = await client.query(
      `INSERT INTO incidencias
         (id_articulo, id_estado, creado_por, asignado_a, prioridad, descripcion_pedido)
       VALUES ($1, $2, $3, $3, $4, $5)
       RETURNING id_incidencia`,
      [id_articulo, ESTADOS.PENDIENTE, creado_por, prioridad, descripcion_pedido]
    );
    const id = nueva.rows[0].id_incidencia;
    await client.query(
      'INSERT INTO incidencias_estados (id_incidencia, id_estado) VALUES ($1, $2)',
      [id, ESTADOS.PENDIENTE]
    );
    await client.query('COMMIT');
    return id;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const cambiarEstado = async ({ id, id_estado, asignado_a = null, descripcion_resolucion = null }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE incidencias
       SET id_estado = $1,
           asignado_a = COALESCE($2, asignado_a),
           descripcion_resolucion = COALESCE($3, descripcion_resolucion)
       WHERE id_incidencia = $4`,
      [id_estado, asignado_a, descripcion_resolucion, id]
    );
    await client.query(
      'INSERT INTO incidencias_estados (id_incidencia, id_estado) VALUES ($1, $2)',
      [id, id_estado]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};