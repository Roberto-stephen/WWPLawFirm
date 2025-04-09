// File: helpers/getUserInfo.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { UnauthorizedAccessError } = require('./exceptions');

// PERBAIKAN: Ubah dari (res) menjadi (req)
const getUserInfo = (req) => {
    try {
        // Cek jika req.user sudah tersedia dari middleware auth
        if (req.user) {
            return {
                userId: req.user.userId,
                name: req.user.name || 'Unknown User',
                type: req.user.type
            };
        }
        
        // Jika tidak, ekstrak token dari cookies atau header
        const token = 
            (req.cookies && req.cookies.token) || 
            (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[1]) || 
            '';
        
        console.log("Token found:", token ? "Yes" : "No", token ? `(${token.substring(0, 10)}...)` : "");
        
        if (!token) {
            console.warn("No token found in request");
            throw new UnauthorizedAccessError("Token not exist");
        }
        
        // Verifikasi token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error("JWT verification error:", jwtError.message);
            if (jwtError.name === 'TokenExpiredError') {
                throw new UnauthorizedAccessError("Token expired");
            } else if (jwtError.name === 'JsonWebTokenError') {
                throw new UnauthorizedAccessError("Invalid token format");
            }
            throw new UnauthorizedAccessError("Token verification failed");
        }
        
        // Validasi isi token
        if (!decoded || typeof decoded !== 'object') {
            console.error("Decoded token is not valid:", decoded);
            throw new UnauthorizedAccessError("Invalid token payload");
        }
        
        console.log("Token decoded successfully:", {
            userId: decoded.userId || 'missing',
            type: decoded.type || 'missing',
            name: decoded.name || 'missing'
        });
        
        // Validasi userId jika ada
        if (decoded.userId && !mongoose.Types.ObjectId.isValid(decoded.userId)) {
            console.error(`Invalid user ID in token: ${decoded.userId}`);
            // Gunakan default MongoDB ObjectId jika ada masalah dengan ID
            decoded.userId = new mongoose.Types.ObjectId().toString();
            console.log(`Replacing with valid ID: ${decoded.userId}`);
        }
        
        return {
            userId: decoded.userId || new mongoose.Types.ObjectId().toString(),
            name: decoded.name || 'Unknown User',
            type: decoded.type || 'client',
        };
    } catch (error) {
        console.error("getUserInfo error:", error.message);
        throw new UnauthorizedAccessError(error.message || "Invalid token");
    }
};

module.exports = getUserInfo;