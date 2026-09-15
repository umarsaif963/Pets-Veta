const { createAuthTokens } = require('../services/authToken.services')
const { uploadToCloudinary } = require('../utils/cloudinary.utils');
const { getGoogleAuthUrl } = require('../utils/googleAuth');
const { createAccountByGoogleService } = require('../services/auth.services');
const { jwtSign, Token_Types } = require('../utils/jwt');
const cookiesOptions = require('../utils/cookiesOption');
const requireFields = require('../utils/validateRequest');
const authServices = require('../services/auth.services')
const sendResponse = require('../utils/SendResponse');
const authUtils = require('../utils/auth.utils');
const catchAsync = require('../utils/CatchAsync')
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');


const verifyUser = catchAsync(async (req, res) => {
    requireFields(["id", "email"], req.user);
    const { id, email } = req.user;
    const userData = await authServices.verifyEmail(email);
    if (!userData) {
        throw new AppError("User do not Exist", 401)
    }
    const user = {
        id: userData.id,
        name: userData.fullName,
        email: userData.email,
        username: userData.username,
        role: userData.userRole.role,
        profileImageUrl: userData.profileImageUrl
    }
    return sendResponse(res, 200, "Success", user);

}

)

const getGoogleUrlController = catchAsync(async (req, res) => {
    const url = getGoogleAuthUrl();
    console.log("URL is ", url);
    sendResponse(res, 200, "Success", { url })

})

const handleGoogleCallbackController = catchAsync(async (req, res) => {
    const { code } = req.query;

    if (!code) {
        throw new AppError("Authorization code is missing from Google", 400)
    }

    const { user, accessToken, refreshToken } = await createAccountByGoogleService(code);

    res.cookie('accessToken', accessToken, cookiesOptions);
    res.cookie('refreshToken', refreshToken, cookiesOptions);
    const frontendDashboardUrl = `http://localhost:5173/auth-success`
    return res.redirect(frontendDashboardUrl);
})


const createDoctorAccount = catchAsync(async (req, res) => {
    console.log("Doctor Account....", req.body.password);

    if (!req.file) {

        throw new AppError("File is missing", 400);
    }

    requireFields(["fullName", "username", "fees", "email", "password", "phone", "education", "specialization", "medicalLicenseNumber", "address", "experience"], req.body)
    const { fullName, username, email, password, fees, phone,
        education, specialization, medicalLicenseNumber, address, experience } = req.body;
    console.log("I run....")
    req.body.fees = Number(req.body.fees);

    const isDoctorExist = await authServices.verifyEmail(email);
    const isUsernameExist = await authServices.verifyUsername(username);

    if (isDoctorExist || isUsernameExist) {
        throw new AppError("User already exists", 409);
    }

    const result = await uploadToCloudinary(
        req.file.buffer,
        "pets-veta/doctor-document"
    );


    const publicUrl = result.secure_url;
    const publicId = result.public_id;

    const hashedPassword = await bcrypt.hash(password, 12);

    const doctorData = {
        fullName: fullName,
        username: username,
        email: email,
        phone: phone,
        password: hashedPassword,
        education: education,
        specialization: specialization,
        medicalLicenseNumber: medicalLicenseNumber,
        address: address,
        experience: experience,
        fees: fees,
        publicId: publicId,
        publicUrl: publicUrl
    }


    let newDoctor = await authServices.createDoctor(doctorData);

    if (!newDoctor) {
        throw new AppError("User already Exist", 400);
    }

    const otpCode = authUtils.otpGenerator();
    const hashedOtp = await bcrypt.hash(otpCode, 12);
    await authServices.saveUserOtp(email, hashedOtp);

    const payload = {
        id: newDoctor.id,
        email: newDoctor.email
    };

    newDoctor = {
        id: newDoctor.id,
        email: newDoctor.email,
        username: newDoctor.username,
        role: newDoctor.userRole.role

    }

    const otpToken = jwtSign(payload, Token_Types.OTP);

    res.cookie('otpToken', otpToken, cookiesOptions);

    try {
        const info = await authUtils.sendOtp(email, otpCode);
        console.log("OTP sent to", email, info?.messageId);
    } catch (err) {
        console.error("Failed to send OTP email:", err?.message);
    }

    return sendResponse(res, 201, "Success", newDoctor);

})


const createPetOwnerAccount = catchAsync(async (req, res) => {

    requireFields(["fullName", "username", "email", "password"], req.body);

    const { fullName, username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const petOwnerData = {
        ...req.body,
        hashedPassword
    }



    let newPetOwner = await authServices.createPetOwner(petOwnerData);
    if (!newPetOwner) {
        throw new AppError("Account already Created", 400);
    }

    let validPetOwner = {
        id: newPetOwner.id,
        username: newPetOwner.username,
        email: newPetOwner.email,
        role: newPetOwner.userRole.role
    }

    const otpCode = authUtils.otpGenerator();
    const hashedOtp = await bcrypt.hash(otpCode, 12);
    await authServices.saveUserOtp(email, hashedOtp);

    const payload = {
        id: newPetOwner.id,
        email: newPetOwner.email,
        role: newPetOwner.userRole.role
    }

    const otpToken = jwtSign(payload, Token_Types.OTP);

    res.cookie('otpToken', otpToken, cookiesOptions);

    try {
        const info = await authUtils.sendOtp(email, otpCode);
        console.log("OTP sent to", email, info?.messageId);
    } catch (err) {
        // The otpToken cookie is already set above, so the user can still
        // request a fresh code via the "Resend OTP" flow.
        console.error("Failed to send OTP email:", err?.message);
    }

    return sendResponse(res, 200, "Success", validPetOwner);


}
)


const createAdminAccount = catchAsync(async (req, res) => {


    requireFields(["fullName", "username", "email", "password"], req.body);

    const { fullName, username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const adminData = {
        ...req.body,
        hashedPassword,

    }

    const newAdmin = await authServices.createAdmin(adminData);

    if (!newAdmin) {

        throw new AppError("Admin already exist", 400);
    }

    const validAdmin = {
        id: newAdmin.id,
        role: newAdmin.userRole.role,
        email: newAdmin.email
    }

    const payload = {
        id: newAdmin.id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.userRole.role,
    }



    const { accessToken, refreshToken } = createAuthTokens(payload);
    await authServices.refreshUserToken(email, refreshToken);

    res.cookie("accessToken", accessToken, cookiesOptions);
    res.cookie("refreshToken", refreshToken, cookiesOptions);

    return sendResponse(res, 200, "Success", validAdmin);


})


const adminLogin = catchAsync(async (req, res) => {

    requireFields(["email", "password"], req.body);

    const { email, password } = req.body;
    console.log("Admin Login Controller Hit....");

    const isValidUser = await authServices.getUserWithRole(email);
    console.log("Valid Admn is ", isValidUser)
    if (!isValidUser) {
        throw new AppError("Invalid User Access", 401);
    }

    console.log("Valid User is ", isValidUser);
    const isPasswordMatch = await bcrypt.compare(password, isValidUser.password);
    if (!isPasswordMatch) {
        throw new AppError("Invalid Code or Password", 401);

    }

    const validUser = {
        name: isValidUser.fullName,
        email: isValidUser.email,
        username: isValidUser.username,
        role: isValidUser.userRole.role

    }

    const payload = {
        id: isValidUser.id,
        username: isValidUser.username,
        email: isValidUser.email,
        role: isValidUser.userRole.role
    }

    const { accessToken, refreshToken } = createAuthTokens(payload);
    await authServices.refreshUserToken(email, refreshToken);

    res.cookie("accessToken", accessToken, cookiesOptions);
    res.cookie("refreshToken", refreshToken, cookiesOptions);

    return sendResponse(res, 200, "Success", validUser)

})


const loginUserAccount = catchAsync(async (req, res) => {

    requireFields(["email", "password"], req.body);

    const { email, password } = req.body;


    const user = await authServices.loginUser(req.body);
    console.log("User is ", user);
    if (!user) {
        throw new AppError("Email or Password invalid", 401);
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
        throw new AppError("Email or Password invalid", 401);
    }


    const validUser = {
        name: user.fullName,
        email: user.email,
        username: user.username,
        role: user.userRole.role,
        profileImageUrl: user.profileImageUrl

    }

    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.userRole.role
    }

    const { accessToken, refreshToken } = createAuthTokens(payload);
    await authServices.refreshUserToken(email, refreshToken);

    res.cookie("accessToken", accessToken, cookiesOptions);
    res.cookie("refreshToken", refreshToken, cookiesOptions);

    return sendResponse(res, 200, "Success", validUser)
}
)


const refreshTokenController = catchAsync(async (req, res) => {
    console.log("I hit.....");
    requireFields(["id", "email",], req.user);
    const { id, email, role } = req.user;
    const payload = {
        id: id,
        email: email,
        role: role
    }

    const { accessToken, refreshToken } = createAuthTokens(payload);


    res.cookie("accessToken", accessToken, cookiesOptions);
    res.cookie("refreshToken", refreshToken, cookiesOptions);



    await authServices.refreshUserToken(email, refreshToken);

    const user = {
        email: email
    }

    return sendResponse(res, 200, "Token Refreshed", user);


})


const verifyUserEmail = catchAsync(async (req, res) => {

    requireFields(["email"], req.body);

    const { email } = req.body;
    const validUser = await authServices.verifyEmail(email);
    if (!validUser) {
        throw new AppError("User Invalid", 400);
    }
    const otpCode = authUtils.otpGenerator();
    const hashedOtp = await bcrypt.hash(otpCode, 12);
    await authServices.saveUserOtp(email, hashedOtp);
    authUtils.sendOtp(email, otpCode)
        .then(() => {
            console.log("OTP sent");
        })
        .catch((err) => {
            console.log("OTP error", err);
        });

    const payload = {
        id: validUser.id,
        email: validUser.email,

    }
    const otpToken = jwtSign(payload, Token_Types.OTP);

    res.cookie('otpToken', otpToken, cookiesOptions);

    return sendResponse(res, 200, "Otp sent", email);


})


const verifyOtp = catchAsync(async (req, res) => {


    const { id, email } = req.user;
    const { otp } = req.body;
    console.log("OTP is ", otp)
    requireFields(["id", "email"], req.user);
    requireFields(["otp"], req.body);


    const validUser = await authServices.verifyEmail(email);
    if (!validUser) {
        throw new AppError("Invalid user email", 400);
    }


    const isMatched = await bcrypt.compare(otp, validUser.otp);
    if (!isMatched) {
        throw new AppError("OTP code invalid", 400);
    }

    const updatedUserSchema = await authServices.updateOtpField(email);
    const userData = await authServices.getUserWithRole(email);

    const payload = {
        id: validUser.id,
        username: validUser.username,
        email: validUser.email,
        role: userData.userRole.role
    }

    const { accessToken, refreshToken } = createAuthTokens(payload);
    await authServices.refreshUserToken(email, refreshToken);

    res.cookie("accessToken", accessToken, cookiesOptions);
    res.cookie("refreshToken", refreshToken, cookiesOptions);
    // res.clearCookie("otpToken", cookiesOptions);

    const safeUser = {
        id: updatedUserSchema.id,
        username: updatedUserSchema.username,
        email: updatedUserSchema.email,
        role: userData.userRole.role
    };

    return sendResponse(
        res,
        200,
        "Success",
        safeUser
    );



})


const resendUserOtp = catchAsync(async (req, res) => {

    const { email } = req.user;
    const validUser = await authServices.verifyEmail(email);
    if (!validUser) {
        throw new AppError("Invalid User Email", 400);
    }
    const otpCode = authUtils.otpGenerator();
    const hashedOtp = await bcrypt.hash(otpCode, 12);
    await authServices.saveUserOtp(email, hashedOtp);
    authUtils.sendOtp(email, otpCode)
        .then(() => {
            console.log("OTP sent");
        })
        .catch((err) => {
            console.log("OTP error", err);
        });
    const payload = {
        id: validUser.id,
        email: validUser.email,

    }
    const otpToken = jwtSign(payload, Token_Types.OTP);

    res.cookie('otpToken', otpToken, cookiesOptions);

    return sendResponse(res, 201, "Success", validUser.email);
})


const resetUserPassword = catchAsync(async (req, res) => {

    const { id, email } = req.user;
    const { password } = req.body;
    requireFields(["id", "email"], req.user);
    requireFields(["password"], req.body);
    console.log("Data is ", req.body);

    const isValidUser = await authServices.verifyEmail(email);
    console.log("Valid User is", isValidUser);
    if (!isValidUser) {
        throw new AppError("Invalid User", 400)
    }
    const isMatched = await bcrypt.compare(password, isValidUser.password);
    if (isMatched) {
        throw new AppError("New password cannot be same as old password", 400);
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await authServices.updateUserPassword(id, hashedPassword);
    res.clearCookie("otpToken", cookiesOptions);
    return sendResponse(res, 201, "Password Reset", isValidUser.email)


})

const logoutUser = catchAsync(async (req, res) => {
    if (!req.user) {
        throw new AppError("Not Valid User Session", 400);
    }

    const userData = await authServices.verifyEmail(req.user.email);
    if (!userData) {
        return sendResponse(res, 200, "Invalid user session", false);
    }

    res.clearCookie('accessToken', cookiesOptions);
    res.clearCookie('refreshToken', cookiesOptions);
    res.clearCookie('otpToken', cookiesOptions);

    return sendResponse(res, 200, "User Logout successfully", userData);
});




module.exports = {
    createDoctorAccount,
    createPetOwnerAccount,
    loginUserAccount,
    refreshTokenController,
    verifyUserEmail,
    resetUserPassword,
    verifyOtp,
    resendUserOtp,
    createAdminAccount,
    adminLogin,
    handleGoogleCallbackController,
    getGoogleUrlController,
    verifyUser,
    logoutUser
}
