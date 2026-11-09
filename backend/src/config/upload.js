import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
export const AVATAR_DIR = path.join(UPLOADS_DIR, 'avatars');

fs.mkdirSync(AVATAR_DIR, { recursive: true });

// La extensión se decide por el tipo real del archivo, no por el nombre que manda el cliente
const EXTENSIONES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.usuario.id_usuario}-${Date.now()}${EXTENSIONES[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (EXTENSIONES[file.mimetype]) return cb(null, true);
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  },
});

// Middleware de carga de archivos: espera un campo "avatar" y responde 400 si algo falla
export const subirAvatar = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      const mensaje = err.code === 'LIMIT_FILE_SIZE' ? 'La imagen no puede superar los 2 MB' : err.message;
      return res.status(400).json({ status: 'ERROR', message: mensaje });
    }
    next();
  });
};