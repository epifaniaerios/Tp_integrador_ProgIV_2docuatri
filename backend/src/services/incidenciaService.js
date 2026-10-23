import * as incidenciaRepository from '../repositories/incidenciaRepository.js';
import { ROLES, ESTADOS } from '../config/constantes.js';

const crearError = (status, mensaje) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const obtenerVisible = async (id, usuario) => {
  const incidencia = await incidenciaRepository.buscarPorId(id);
  if (!incidencia) throw crearError(404, 'Incidencia no encontrada');

  const { rol, id_usuario } = usuario;
  const puedeVer =
    rol === ROLES.DIRECTOR_SISTEMAS ||
    (rol === ROLES.EMPLEADO_MUNICIPAL && incidencia.creado_por === id_usuario) ||
    (rol === ROLES.EMPLEADO_SISTEMAS && incidencia.asignado_a === id_usuario);

  if (!puedeVer) throw crearError(403, 'No tenés permiso para ver esta incidencia');
  return incidencia;
};

export const listar = async (usuario) => {
  return incidenciaRepository.listar({ rol: usuario.rol, id_usuario: usuario.id_usuario });
};

export const obtenerPorId = async (id, usuario) => {
  return obtenerVisible(Number(id), usuario);
};

export const crear = async (datos, usuario) => {
  const articulo = await incidenciaRepository.articuloActivo(datos.id_articulo);
  if (!articulo) throw crearError(404, 'El artículo indicado no existe o está inactivo');

  const id = await incidenciaRepository.crear({
    id_articulo: datos.id_articulo,
    descripcion_pedido: datos.descripcion_pedido,
    prioridad: datos.prioridad || 2, // 1 = alta, 2 = media, 3 = baja
    creado_por: usuario.id_usuario,
  });
  return incidenciaRepository.buscarPorId(id);
};

export const cancelar = async (id, usuario) => {
  const incidencia = await incidenciaRepository.buscarPorId(Number(id));
  if (!incidencia) throw crearError(404, 'Incidencia no encontrada');

  if (usuario.rol === ROLES.EMPLEADO_MUNICIPAL && incidencia.creado_por !== usuario.id_usuario) {
    throw crearError(403, 'Solo podés cancelar incidencias que creaste vos');
  }
  if (incidencia.id_estado !== ESTADOS.PENDIENTE) {
    throw crearError(400, 'Solo se pueden cancelar incidencias en estado Pendiente');
  }

  await incidenciaRepository.cambiarEstado({ id: incidencia.id_incidencia, id_estado: ESTADOS.CANCELADA });
  return incidenciaRepository.buscarPorId(incidencia.id_incidencia);
};

export const asignar = async (id, asignado_a) => {
  const incidencia = await incidenciaRepository.buscarPorId(Number(id));
  if (!incidencia) throw crearError(404, 'Incidencia no encontrada');

  if (![ESTADOS.PENDIENTE, ESTADOS.EN_PROCESO].includes(incidencia.id_estado)) {
    throw crearError(400, 'Solo se pueden asignar incidencias Pendientes o En Proceso');
  }

  const empleado = await incidenciaRepository.buscarEmpleadoSistemas(asignado_a);
  if (!empleado) throw crearError(400, 'El usuario indicado no es un empleado activo del área de Sistemas');

  await incidenciaRepository.cambiarEstado({
    id: incidencia.id_incidencia,
    id_estado: ESTADOS.EN_PROCESO,
    asignado_a,
  });
  return incidenciaRepository.buscarPorId(incidencia.id_incidencia);
};

export const finalizar = async (id, descripcion_resolucion, usuario) => {
  const incidencia = await incidenciaRepository.buscarPorId(Number(id));
  if (!incidencia) throw crearError(404, 'Incidencia no encontrada');

  if (incidencia.asignado_a !== usuario.id_usuario) {
    throw crearError(403, 'Solo podés finalizar incidencias asignadas a vos');
  }
  if (incidencia.id_estado !== ESTADOS.EN_PROCESO) {
    throw crearError(400, 'Solo se pueden finalizar incidencias En Proceso');
  }

  await incidenciaRepository.cambiarEstado({
    id: incidencia.id_incidencia,
    id_estado: ESTADOS.RESUELTA,
    descripcion_resolucion,
  });
  return incidenciaRepository.buscarPorId(incidencia.id_incidencia);
};