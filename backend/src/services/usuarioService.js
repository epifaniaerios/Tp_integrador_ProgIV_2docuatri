import * as usuarioRepository from '../repositories/usuarioRepository.js';

export const listarEmpleadosSistemas = async () => {
  return usuarioRepository.listarEmpleadosSistemas();
};