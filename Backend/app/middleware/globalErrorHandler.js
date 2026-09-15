const multer = require('multer');

const globalErrorHandler = (err, req, res, next) => {
    console.log(err);
    
    let statusCode = err.statusCode || 500;

    // Upload validation errors (wrong file type, file too large) are client
    // errors, not server errors. Report them as 400 so the frontend can show
    // the actual validation message.
    if (
        err instanceof multer.MulterError ||
        (typeof err.message === 'string' && err.message.includes('Invalid file type'))
    ) {
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        status: err.status || "error",
        message: err.message || "Something went wrong"
    })

};

module.exports = globalErrorHandler;