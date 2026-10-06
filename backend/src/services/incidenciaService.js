const incidenciaRepository = require('../repositories/incidenciaRepository');

const obtenerIncidencias = async () => {
  return await incidenciaRepository.listarTodas();
};

const obtenerIncidenciaPorId = async (id) => {
  const incidencia = await incidenciaRepository.buscarPorId(id);
  if (!incidencia) {
    const error = new Error('Incidencia no encontrada');
    error.status = 404;
    throw error;
  }
  return incidencia;
};

const registrarIncidencia = async (datos) => {
  const prioridadValida = datos.prioridad || 'MEDIA';
  return await incidenciaRepository.crear({ ...datos, prioridad: prioridadValida });
};

const actualizarEstado = async (id, estado) => {
  await obtenerIncidenciaPorId(id);
  return await incidenciaRepository.cambiarEstado(id, estado);
};

const eliminarIncidencia = async (id) => {
  await obtenerIncidenciaPorId(id);
  return await incidenciaRepository.eliminarLogico(id);
};

module.exports = {
  obtenerIncidencias,
  obtenerIncidenciaPorId,
  registrarIncidencia,
  actualizarEstado,
  eliminarIncidencia,
};