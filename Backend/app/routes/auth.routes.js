const express = require('express');
const Router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');
const { authLimiter, refreshLimiter } = require('../middleware/rateLimiter');
const { validateRequest } = require('../middleware/zod.middleware')
const { doctorSchema, petOwnerSchema, loginSchema, resetPasswordSchema, forgotPasswordSchema } = require('../schema/zod.schema')

Router
    .route('/me')
    .get(authMiddleware.protect, authController.verifyUser)

Router
    .route('/google/url')
    .get(authLimiter, authController.getGoogleUrlController)

Router
    .route('/google/callback')
    .get(authLimiter, authController.handleGoogleCallbackController)

Router
    .route('/register/doctor')
    .post(upload.single('document'), authController.createDoctorAccount)

Router
    .route('/register/pet-owner')
    .post(authLimiter, validateRequest(petOwnerSchema), authController.createPetOwnerAccount)

Router
    .route('/register/admin')
    .post(authLimiter, authController.createAdminAccount)

Router
    .route('/login/admin')
    .post(authLimiter, validateRequest(loginSchema), authController.adminLogin)

Router
    .route('/login/user')
    .post(authLimiter, validateRequest(loginSchema), authController.loginUserAccount)

Router
    .route('/logout/user')
    .post(authMiddleware.protect, authController.logoutUser)

Router
    .route('/refresh/token')
    .get(refreshLimiter, authMiddleware.protectRefresh, authController.refreshTokenController)

Router
    .route('/verify/email')
    .post(authLimiter, authController.verifyUserEmail)

Router
    .route('/resend/otp')
    .get(authLimiter, authMiddleware.protectOtpForResend, authController.resendUserOtp)

Router
    .route('/otp-verification')
    .post(authLimiter, authMiddleware.protectOtp, authController.verifyOtp)

Router
    .route('/password-resets')
    .post(authLimiter, authMiddleware.protectOtp, authController.resetUserPassword)

module.exports = Router;