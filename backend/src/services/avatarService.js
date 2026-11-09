import fs from 'fs';
import path from 'path';
import * as avatarRepository from '../repositories/avatarRepository.js';
import { AVATAR_DIR } from '../config/upload.js';

const crearError = (status, mensaje) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

export const obtener = async (id_usuario) => {
  const avatar = await avatarRepository.obtener(id_usuario);
  return { avatar: avatar || null };
};

export const guardar = async (id_usuario, archivo) => {
  if (!archivo) throw crearError(400, 'Seleccioná una imagen (campo "avatar")');

  const anterior = await avatarRepository.obtener(id_usuario);
  const nuevaRuta = `/uploads/avatars/${archivo.filename}`;
  await avatarRepository.actualizar(id_usuario, nuevaRuta);

  // Borra la imagen anterior del disco para no acumular archivos
  if (anterior && anterior.startsWith('/uploads/avatars/')) {
    fs.unlink(path.join(AVATAR_DIR, path.basename(anterior)), () => {});
  }

  return { avatar: nuevaRuta };
};