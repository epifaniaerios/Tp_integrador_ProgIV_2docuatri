import * as categoriaService from '../services/categoriaService.js';

export const listar = async (req, res) => {
  try {
    const categorias = await categoriaService.obtenerCategorias();
    res.status(200).json({ status: 'OK', data: categorias });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

export const obtenerPorId = async (req, res) => {
  try {
    const categoria = await categoriaService.obtenerCategoriaPorId(req.params.id);
    res.status(200).json({ status: 'OK', data: categoria });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

export const crear = async (req, res) => {
  try {
    const nuevaCategoria = await categoriaService.crearCategoria(req.body);
    res.status(201).json({ status: 'OK', message: 'Categoría creada con éxito', data: nuevaCategoria });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

export const actualizar = async (req, res) => {
  try {
    const categoriaActualizada = await categoriaService.actualizarCategoria(req.params.id, req.body);
    res.status(200).json({ status: 'OK', message: 'Categoría actualizada con éxito', data: categoriaActualizada });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

export const eliminar = async (req, res) => {
  try {
    await categoriaService.eliminarCategoria(req.params.id);
    res.status(200).json({ status: 'OK', message: 'Categoría eliminada (Soft Delete) correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};