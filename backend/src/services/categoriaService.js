import * as categoriaRepository from '../repositories/categoriaRepository.js';

export const obtenerCategorias = async () => {
  return await categoriaRepository.listarTodas();
};

export const obtenerCategoriaPorId = async (id) => {
  const categoria = await categoriaRepository.buscarPorId(id);
  if (!categoria) {
    const error = new Error('Categoría no encontrada');
    error.status = 404;
    throw error;
  }
  return categoria;
};

export const crearCategoria = async (datos) => {
  return await categoriaRepository.crear(datos);
};

export const actualizarCategoria = async (id, datos) => {
  await obtenerCategoriaPorId(id); // Valida que exista antes de editar
  return await categoriaRepository.actualizar(id, datos);
};

export const eliminarCategoria = async (id) => {
  await obtenerCategoriaPorId(id); // Valida que exista antes de dar borrado lógico
  return await categoriaRepository.eliminarLogico(id);
};