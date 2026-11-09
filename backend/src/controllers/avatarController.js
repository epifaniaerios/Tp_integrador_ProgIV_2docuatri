import * as avatarService from '../services/avatarService.js';

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

export const obtener = manejar('Avatar del usuario', 200, (req) =>
  avatarService.obtener(req.usuario.id_usuario)
);

export const guardar = manejar('Avatar actualizado', 200, (req) =>
  avatarService.guardar(req.usuario.id_usuario, req.file)
);