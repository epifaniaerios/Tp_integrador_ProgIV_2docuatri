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

export const cambiarPrioridad = async (req, res) => {
  try {
    const { id } = req.params;
    const { prioridad } = req.body;
    
    if (!prioridad || ![1, 2, 3].includes(Number(prioridad))) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'La prioridad debe ser 1 (Alta), 2 (Media) o 3 (Baja)',
      });
    }

    const data = await incidenciaService.cambiarPrioridad(id, Number(prioridad));
    
    return res.status(200).json({
      status: 'OK',
      message: 'Prioridad actualizada con éxito',
      data,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: 'ERROR',
      message: error.message || 'Error al actualizar la prioridad',
    });
  }
};
