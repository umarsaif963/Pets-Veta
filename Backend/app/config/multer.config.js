const multer = require('multer');

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];

    const allowedVideoTypes = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
    ];

    const allowedDocumentTypes = ["application/pdf"];

    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only images (PNG, JPEG, WEBP), videos (MP4, MOV, AVI, WEBM) and PDF documents are allowed!"
            ),
            false
        );
    }
};

const upload = multer(
    {
        storage: storage,
        fileFilter: fileFilter
    }
)



module.exports = upload;
