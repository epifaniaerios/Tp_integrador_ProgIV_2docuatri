import express from 'express';
import * as reporteController from '../controllers/reporteController.js';
import { verificarToken, autorizarRoles } from '../middlewares/authMiddleware.js';
import { ROLES } from '../config/constantes.js';

const router = express.Router();

// Solo el Director del área de Sistemas
const soloDirector = autorizarRoles(ROLES.DIRECTOR_SISTEMAS);

router.get('/dashboard', verificarToken, soloDirector, reporteController.dashboard);
router.get('/incidencias/pdf', verificarToken, soloDirector, reporteController.reportePdf);

export default router;