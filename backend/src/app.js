import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import pool from './config/db.js';

// --- Importación de Rutas ---
import authRoutes from './routes/authRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import incidenciaRoutes from './routes/incidenciaRoutes.js';
import articuloRoutes from './routes/articuloRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares Globales ---
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Registro de solicitudes HTTP

// --- Registrar Rutas de la API ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categorias', categoriaRoutes);
app.use('/api/v1/incidencias', incidenciaRoutes);
app.use('/api/v1/articulos', articuloRoutes);
app.use('/api/v1/reportes', reporteRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/usuarios', usuarioRoutes);

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
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`Prueba de conexión en: http://localhost:${PORT}/api/v1/health`);
});