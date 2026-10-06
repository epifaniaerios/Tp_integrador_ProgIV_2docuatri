const incidenciaService = require('../services/incidenciaService');

const listar = async (req, res) => {
  try {
    const incidencias = await incidenciaService.obtenerIncidencias();
    res.status(200).json({ status: 'OK', data: incidencias });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const incidencia = await incidenciaService.obtenerIncidenciaPorId(req.params.id);
    res.status(200).json({ status: 'OK', data: incidencia });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const nuevaIncidencia = await incidenciaService.registrarIncidencia(req.body);
    res.status(201).json({ status: 'OK', message: 'Incidencia registrada con éxito', data: nuevaIncidencia });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

const cambiarEstado = async (req, res) => {
  try {
    const actualizada = await incidenciaService.actualizarEstado(req.params.id, req.body.estado);
    res.status(200).json({ status: 'OK', message: 'Estado actualizado', data: actualizada });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await incidenciaService.eliminarIncidencia(req.params.id);
    res.status(200).json({ status: 'OK', message: 'Incidencia eliminada (Soft Delete)' });
  } catch (error) {
    res.status(error.status || 500).json({ status: 'ERROR', message: error.message });
  }
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  cambiarEstado,
  eliminar,
};