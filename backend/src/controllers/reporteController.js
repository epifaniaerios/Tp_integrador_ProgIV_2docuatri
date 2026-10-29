import * as reporteService from '../services/reporteService.js';

export const dashboard = async (req, res) => {
  try {
    const data = await reporteService.obtenerDashboard();
    return res.status(200).json({ status: 'OK', message: 'Dashboard de incidencias', data });
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      status: 'ERROR',
      message: error.message || 'Error interno del servidor',
    });
  }
};

export const reportePdf = async (req, res) => {
  try {
    await reporteService.generarPdf(res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res.status(error.status || 500).json({
        status: 'ERROR',
        message: error.message || 'Error interno del servidor',
      });
    }
  }
};