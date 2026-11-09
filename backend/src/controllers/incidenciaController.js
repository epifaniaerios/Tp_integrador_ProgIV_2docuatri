import * as incidenciaService from '../services/incidenciaService.js';

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

export const listar = manejar('Listado de incidencias', 200, (req) =>
  incidenciaService.listar(req.usuario)
);

export const obtenerPorId = manejar('Incidencia encontrada', 200, (req) =>
  incidenciaService.obtenerPorId(req.params.id, req.usuario)
);

export const crear = manejar('Incidencia creada correctamente', 201, (req) =>
  incidenciaService.crear(req.body, req.usuario)
);

export const cancelar = manejar('Incidencia cancelada', 200, (req) =>
  incidenciaService.cancelar(req.params.id, req.usuario)
);

export const asignar = manejar('Incidencia asignada', 200, (req) =>
  incidenciaService.asignar(req.params.id, req.body.asignado_a)
);

export const finalizar = manejar('Incidencia finalizada', 200, (req) =>
  incidenciaService.finalizar(req.params.id, req.body.descripcion_resolucion, req.usuario)
);

export const cambiarPrioridad = manejar('Prioridad actualizada con éxito', 200, (req) =>
  incidenciaService.cambiarPrioridad(req.params.id, Number(req.body.prioridad), req.usuario)
);