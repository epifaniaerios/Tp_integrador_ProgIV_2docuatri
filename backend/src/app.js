const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares Globales ---
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Middleware de Registro de Solicitudes

// --- Ruta de Verificación de Salud de la API ---
app.get('/api/v1/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'OK',
      message: 'API funcionando correctamente',
      dbTime: dbResult.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Error al conectar con la Base de Datos',
      error: error.message,
    });
  }
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(` Servidor corriendo en el puerto http://localhost:${PORT}`);
  console.log(` Prueba de conexión en: http://localhost:${PORT}/api/v1/health`);
});