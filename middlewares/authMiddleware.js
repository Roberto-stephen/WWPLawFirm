const jwt = require('jsonwebtoken');
const { DoNotHaveAccessError } = require('../helpers/exceptions');
const getUserInfo = require('../helpers/getUserInfo');

const requireAuth = (req, res, next) => {
    // Cek token dari Authorization header atau cookies
    const token = 
        req.headers.authorization?.split(' ')[1] || // Bearer token
        req.cookies?.token; // Cookie token

    if (!token) {
        return res.status(401).json({
            status: 401,
            info: "Unauthorized Access",
            error_code: 401,
            message: "No token provided"
        });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.decodedToken = decodedToken;
        next();
    } catch (err) {
        return res.status(401).json({
            status: 401,
            info: "Unauthorized Access",
            error_code: 401,
            message: "Invalid or expired token"
        });
    }
}

const requireLawyerAndAdmin = (req, res, next) => {
    try {
        const { type } = getUserInfo(res);
        if (type === "client") {
            throw new DoNotHaveAccessError("User do not have access to perform such action");
        }
        next();
    } catch (error) {
        res.status(403).json({
            error: error.name,
            message: error.message
        });
    }
}

const requireAdmin = (req, res, next) => {
    try {
        const { type } = getUserInfo(res);
        if (type !== "admin") {
            throw new DoNotHaveAccessError("User do not have access to perform such action");
        }
        next();
    } catch (error) {
        res.status(403).json({
            error: error.name,
            message: error.message
        });
    }
}

module.exports = { requireAuth, requireLawyerAndAdmin, requireAdmin };