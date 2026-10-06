const categoriaService = require('../services/categoriaService');

const listar = async (req, res) => {
  try {
    const categorias = await categoriaService.obtenerCategorias();
    res.status(200).json({ status: 'OK', data: categorias });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const categoria = await categoriaService.obtenerCategoriaPorId(req.params.id);
    res.status(200).json({ status: 'OK', data: categoria });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const nuevaCategoria = await categoriaService.crearCategoria(req.body);
    res.status(201).json({ status: 'OK', message: 'Categoría creada con éxito', data: nuevaCategoria });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const categoriaActualizada = await categoriaService.actualizarCategoria(req.params.id, req.body);
    res.status(200).json({ status: 'OK', message: 'Categoría actualizada con éxito', data: categoriaActualizada });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await categoriaService.eliminarCategoria(req.params.id);
    res.status(200).json({ status: 'OK', message: 'Categoría eliminada (Soft Delete) correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};