import * as usuarioRepository from '../repositories/usuarioRepository.js';

export const listarEmpleadosSistemas = async () => {
  return usuarioRepository.listarEmpleadosSistemas();
};

export const subirAvatar = async (id_usuario, nombreArchivo) => {
  if (!nombreArchivo) {
    const error = new Error('No se ha proporcionado ninguna imagen');
    error.status = 400;
    throw error;
  }
  return usuarioRepository.actualizarAvatar(id_usuario, nombreArchivo);
};

import crypto from 'crypto';

export const cambiarClave = async (id_usuario, claveActual, claveNueva) => {
  const claveGuardada = await usuarioRepository.obtenerClavePorId(id_usuario);
  if (!claveGuardada) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  const hashActual = crypto.createHash('sha256').update(claveActual).digest('hex');
  if (hashActual !== claveGuardada) {
    const error = new Error('La contraseña actual es incorrecta');
    error.status = 400;
    throw error;
  }

  if (!claveNueva || claveNueva.trim().length < 6) {
    const error = new Error('La nueva contraseña debe tener al menos 6 caracteres');
    error.status = 400;
    throw error;
  }

  await usuarioRepository.actualizarClave(id_usuario, claveNueva);
};
