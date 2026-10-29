import * as articuloRepository from '../repositories/articuloRepository.js';

const crearError = (status, mensaje) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const validarRelaciones = async ({ id_area, id_categoria }) => {
  if (!(await articuloRepository.areaActiva(id_area))) {
    throw crearError(400, 'El área indicada no existe o está inactiva');
  }
  if (!(await articuloRepository.categoriaActiva(id_categoria))) {
    throw crearError(400, 'La categoría indicada no existe o está inactiva');
  }
};

export const listar = async () => articuloRepository.listarTodos();

export const obtenerPorId = async (id) => {
  const articulo = await articuloRepository.buscarPorId(id);
  if (!articulo) throw crearError(404, 'Artículo no encontrado');
  return articulo;
};

export const crear = async (datos) => {
  await validarRelaciones(datos);
  return articuloRepository.crear(datos);
};

export const actualizar = async (id, datos) => {
  await obtenerPorId(id);
  await validarRelaciones(datos);
  return articuloRepository.actualizar(id, datos);
};

export const eliminar = async (id) => {
  await obtenerPorId(id);
  return articuloRepository.eliminarLogico(id);
};