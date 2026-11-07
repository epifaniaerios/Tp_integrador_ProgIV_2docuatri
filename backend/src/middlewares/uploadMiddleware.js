import multer from 'multer';
import path from 'path';

// Configuración para guardar en la carpeta 'uploads/'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Genera un nombre único: avatar-idUsuario-timestamp.ext
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${req.usuario.id_usuario}-${Date.now()}${ext}`);
    },
});

// Filtro para aceptar solo imágenes JPG, PNG o WEBP
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no soportado. Solo se permiten imágenes JPG, PNG o WEBP.'), false);
    }
};

export const uploadAvatar = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Máximo 2MB
    fileFilter,
});
