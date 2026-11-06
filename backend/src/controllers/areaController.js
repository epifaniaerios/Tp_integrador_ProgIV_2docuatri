import * as areaService from '../services/areaService.js';

export const listar = async (req, res) => {
  try {
    const data = await areaService.listar();
    return res.status(200).json({ status: 'OK', message: 'Listado de áreas', data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor' });
  }
};