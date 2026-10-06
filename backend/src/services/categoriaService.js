const categoriaRepository = require('../repositories/categoriaRepository');

const obtenerCategorias = async () => {
  return await categoriaRepository.listarTodas();
};

const obtenerCategoriaPorId = async (id) => {
  const categoria = await categoriaRepository.buscarPorId(id);
  if (!categoria) {
    const error = new Error('Categoría no encontrada');
    error.status = 404;
    throw error;
  }
  return categoria;
};

const crearCategoria = async (datos) => {
  return await categoriaRepository.crear(datos);
};

const actualizarCategoria = async (id, datos) => {
  await obtenerCategoriaPorId(id); // Valida que exista antes de editar
  return await categoriaRepository.actualizar(id, datos);
};

const eliminarCategoria = async (id) => {
  await obtenerCategoriaPorId(id); // Valida que exista antes de dar borrado lógico
  return await categoriaRepository.eliminarLogico(id);
};

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};