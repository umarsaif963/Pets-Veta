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

    // The account is only created once the OTP is verified, so the code must
    // be delivered first. If the email cannot be sent the request fails loudly
    // and the frontend stays on the signup form instead of navigating away to a
    // page that will never receive a code.
    const otpCode = authUtils.otpGenerator();
    const hashedOtp = await bcrypt.hash(otpCode, 12);

    try {
        const info = await authUtils.sendOtp(email, otpCode);
        console.log("OTP sent to", email, info?.messageId);
    } catch (err) {
        console.error("Failed to send OTP email:", err?.message);
        throw new AppError("We couldn't send the verification code to your email. Please check your email address and try again.", 502);
    }

    const payload = {
        purpose: "SIGNUP",
        role: "Doctor",
        email,
        hashedOtp,
        pendingData: doctorData
    };

    const otpToken = jwtSign(payload, Token_Types.OTP);

    res.cookie('otpToken', otpToken, cookiesOptions);

    return sendResponse(res, 201, "Success", {
        email: doctorData.email,
        username: doctorData.username,
        role: "Doctor",
        expiresIn: authUtils.otpExpirySeconds()
    });

})


const createPetOwnerAccount = catchAsync(async (req, res) => {

    requireFields(["fullName", "username", "email", "password"], req.body);

    const { fullName, username, email, password } = req.body;

    const isEmailTaken = await authServices.isEmailOrUsernameTaken(email, username);
    if (isEmailTaken) {
        throw new AppError("Account already Created", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const petOwnerData = {
        fullName,
        username,
        email,
        hashedPassword
    }

    // The account is only created once the OTP is verified, so the code must
    // be delivered first. If the email cannot be sent the request fails loudly
    // and the frontend stays on the signup form instead of navigating away to a
    // page that will never receive a code.
    const otpCode = authUtils.otpGenerator();
    const hashedOtp = await bcrypt.hash(otpCode, 12);

    try {
        const info = await authUtils.sendOtp(email, otpCode);
        console.log("OTP sent to", email, info?.messageId);
    } catch (err) {
        console.error("Failed to send OTP email:", err?.message);
        throw new AppError("We couldn't send the verification code to your email. Please check your email address and try again.", 502);
    }

    const payload = {
        purpose: "SIGNUP",
        role: "PetOwner",
        email,
        hashedOtp,
        pendingData: petOwnerData
    }

    const otpToken = jwtSign(payload, Token_Types.OTP);

    res.cookie('otpToken', otpToken, cookiesOptions);

    return sendResponse(res, 200, "Success", {
        email: petOwnerData.email,
        username: petOwnerData.username,
        role: "PetOwner",
        expiresIn: authUtils.otpExpirySeconds()
    });


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

    try {
        const info = await authUtils.sendOtp(email, otpCode);
        console.log("OTP sent", info?.messageId);
    } catch (err) {
        console.error("Failed to send OTP email:", err?.message);
        throw new AppError("We couldn't send the verification code to your email. Please try again.", 502);
    }

    const payload = {
        id: validUser.id,
        email: validUser.email,

    }
    const otpToken = jwtSign(payload, Token_Types.OTP);

    res.cookie('otpToken', otpToken, cookiesOptions);

    return sendResponse(res, 200, "Otp sent", {
        email,
        expiresIn: authUtils.otpExpirySeconds()
    });


})


const verifyOtp = catchAsync(async (req, res) => {

    requireFields(["otp"], req.body);
    const { otp } = req.body;
    console.log("OTP is ", otp)

    // Signup flow: the account does not exist yet. The pending registration
    // data lived inside the otpToken cookie, so the account is created here,
    // after the code has been verified.
    if (req.user.purpose === "SIGNUP") {
        const { email, role, hashedOtp, pendingData } = req.user;

        const isMatched = await bcrypt.compare(otp, hashedOtp);
        if (!isMatched) {
            throw new AppError("OTP code invalid", 400);
        }

        let createdUser;
        if (role === "Doctor") {
            createdUser = await authServices.createDoctor(pendingData);
        } else {
            createdUser = await authServices.createPetOwner(pendingData);
        }

        if (!createdUser) {
            throw new AppError("Account already Created", 400);
        }

        const updatedUserSchema = await authServices.updateOtpField(email);
        const userData = await authServices.getUserWithRole(email);

        const payload = {
            id: createdUser.id,
            username: createdUser.username,
            email: createdUser.email,
            role: userData.userRole.role
        }

        const { accessToken, refreshToken } = createAuthTokens(payload);
        await authServices.refreshUserToken(email, refreshToken);

        res.cookie("accessToken", accessToken, cookiesOptions);
        res.cookie("refreshToken", refreshToken, cookiesOptions);
        res.clearCookie("otpToken", cookiesOptions);

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
    }


    const { id, email } = req.user;
    requireFields(["id", "email"], req.user);

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

    // Signup flow: no account exists yet, so the pending data is re-signed
    // into a fresh token along with a new code instead of storing it in the DB.
    if (req.user.purpose === "SIGNUP") {
        const { email, role, pendingData } = req.user;

        const otpCode = authUtils.otpGenerator();
        const hashedOtp = await bcrypt.hash(otpCode, 12);

        try {
            const info = await authUtils.sendOtp(email, otpCode);
            console.log("OTP resent", info?.messageId);
        } catch (err) {
            console.error("Failed to resend OTP email:", err?.message);
            throw new AppError("We couldn't resend the verification code to your email. Please try again.", 502);
        }

        const payload = {
            purpose: "SIGNUP",
            role,
            email,
            hashedOtp,
            pendingData
        }
        const otpToken = jwtSign(payload, Token_Types.OTP);

        res.cookie('otpToken', otpToken, cookiesOptions);

        return sendResponse(res, 201, "Success", {
            email,
            expiresIn: authUtils.otpExpirySeconds()
        });
    }

    const { email } = req.user;
    const validUser = await authServices.verifyEmail(email);
    if (!validUser) {
        throw new AppError("Invalid User Email", 400);
    }
    const otpCode = authUtils.otpGenerator();
    const hashedOtp = await bcrypt.hash(otpCode, 12);
    await authServices.saveUserOtp(email, hashedOtp);

    try {
        const info = await authUtils.sendOtp(email, otpCode);
        console.log("OTP resent", info?.messageId);
    } catch (err) {
        console.error("Failed to resend OTP email:", err?.message);
        throw new AppError("We couldn't resend the verification code to your email. Please try again.", 502);
    }

    const payload = {
        id: validUser.id,
        email: validUser.email,

    }
    const otpToken = jwtSign(payload, Token_Types.OTP);

    res.cookie('otpToken', otpToken, cookiesOptions);

    return sendResponse(res, 201, "Success", {
        email: validUser.email,
        expiresIn: authUtils.otpExpirySeconds()
    });
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
