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

export const cambiarAvatar = async (req, res) => {
  try {
    const archivo = req.file ? req.file.filename : null;
    const data = await usuarioService.subirAvatar(req.usuario.id_usuario, archivo);

    return res.status(200).json({
      status: 'OK',
      message: 'Avatar subido y actualizado con éxito',
      data,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: 'ERROR',
      message: error.message || 'Error al subir el avatar',
    });
  }
};

export const cambiarContrasenia = async (req, res) => {
  try {
    const { claveActual, claveNueva } = req.body;
    await usuarioService.cambiarClave(req.usuario.id_usuario, claveActual, claveNueva);

    return res.status(200).json({
      status: 'OK',
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      status: 'ERROR',
      message: error.message || 'Error al cambiar la contraseña',
    });
  }
};
