import * as articuloService from '../services/articuloService.js';

const manejar = (mensajeOk, statusOk, accion) => async (req, res) => {
  try {
    const data = await accion(req);
    return res.status(statusOk).json({ status: 'OK', message: mensajeOk, data });
  } catch (error) {
    const statusCode = error.status || 500;
    if (statusCode === 500) console.error(error);
    return res.status(statusCode).json({
      status: 'ERROR',
      message: error.message || 'Error interno del servidor',
    });
  }
};

export const listar = manejar('Listado de artículos', 200, () => articuloService.listar());
export const obtenerPorId = manejar('Artículo encontrado', 200, (req) => articuloService.obtenerPorId(req.params.id));
export const crear = manejar('Artículo creado correctamente', 201, (req) => articuloService.crear(req.body));
export const actualizar = manejar('Artículo actualizado correctamente', 200, (req) =>
  articuloService.actualizar(req.params.id, req.body)
);
export const eliminar = manejar('Artículo eliminado (borrado lógico)', 200, (req) =>
  articuloService.eliminar(req.params.id)
);