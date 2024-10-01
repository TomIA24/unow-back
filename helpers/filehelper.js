'use strict';
const multer = require('multer');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

// Filtre de fichiers
const filefilter = (req, file, cb) => {
    // Accepter tous les types de fichiers
    cb(null, true);
};

// Configuration de multer
const upload = multer({ storage: storage, fileFilter: filefilter });

// Exportation du middleware
module.exports = { upload };