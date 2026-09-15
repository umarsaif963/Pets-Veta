const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const bearerToken = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;
        const token = req.cookies.accessToken || bearerToken;
        console.log("Cookies in protect are ", req.cookies)
        if (!token) {
            console.log("No Token!");
            return res.status(401).json({ success: false, err: 'Access token missing' });

        }
        const secret = process.env.JWT_ACCESS_SECRET;
        const decoded = jwt.verify(token, secret);

        req.user = decoded;
        console.log("Requset is ", req.user);
        next();

    } catch (error) {
        console.log("Error in jwt middleware", error.message);
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, err: "Token expired or invalid" });
        }

        return res.status(500).json({ success: false, err: error.message })
    }
}

const protectRefresh = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            console.log("No Refresh Token Found!");
            return res.status(401).json({ success: false, err: 'Session expired. Please log in again.' });
        }

        const secret = process.env.JWT_REFRESH_SECRET;
        const decoded = jwt.verify(token, secret);

        req.user = decoded;
        next();

    } catch (error) {
        console.log("Error in refresh token middleware:", error.message);


        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, err: "Session expired. Please log in again." });
        }


        return res.status(500).json({ success: false, err: error.message });
    }
}

const protectOtp = async (req, res, next) => {
    try {
        const otpToken = req.cookies.otpToken;
        console.log("OTP token is ", req.cookies.otpToken);

        if (!otpToken) {
            return res.status(400).json({ err: 'Invalid Cookie' })
        }
        const decoded = jwt.verify(otpToken, process.env.JWT_OTP_SECRET);
        if (!decoded) {
            return res.status(400).json({ err: 'Invalid Decoding in auth middleware' })
        }
        req.user = decoded;
        next();

    } catch (error) {
        console.log("Protect Otp Err", error.message);
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, err: "OTP session expired or invalid. Please request a new code." });
        }
        return res.status(500).json({ success: false, err: error.message })
    }
}

// Like protectOtp, but ignores an expired token so the user can still request
// a fresh code after the OTP has lapsed. The signature is still validated.
const protectOtpForResend = async (req, res, next) => {
    try {
        const otpToken = req.cookies.otpToken;

        if (!otpToken) {
            return res.status(400).json({ err: 'Invalid Cookie' })
        }
        const decoded = jwt.verify(otpToken, process.env.JWT_OTP_SECRET, { ignoreExpiration: true });
        if (!decoded) {
            return res.status(400).json({ err: 'Invalid Decoding in auth middleware' })
        }
        req.user = decoded;
        next();

    } catch (error) {
        console.log("Protect Otp Resend Err", error.message);
        return res.status(401).json({ success: false, err: "OTP session invalid. Please start again." })
    }
}
module.exports = {
    protect,
    protectRefresh,
    protectOtp,
    protectOtpForResend
}
