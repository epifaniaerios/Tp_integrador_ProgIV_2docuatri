import * as usuarioService from '../services/usuarioService.js';

export const listarEmpleadosSistemas = async (req, res) => {
  try {
    const data = await usuarioService.listarEmpleadosSistemas();
    return res.status(200).json({ status: 'OK', message: 'Empleados del área de Sistemas', data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'ERROR', message: 'Error interno del servidor' });
  }
};