const multer = require('multer');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'foto');
      error.message = 'Apenas imagens JPG, JPEG e PNG são permitidas';
      return cb(error);
    }

    return cb(null, true);
  },
});

function uploadSingleFoto(req, res, next) {
  return upload.single('foto')(req, res, next);
}

function handleUploadError(error, res) {
  if (!error) {
    return false;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'A imagem deve ter no máximo 5 MB'
      });
      return true;
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        message: error.message || 'Apenas imagens JPG, JPEG e PNG são permitidas'
      });
      return true;
    }
  }

  return false;
}

module.exports = {
  uploadSingleFoto,
  handleUploadError,
};