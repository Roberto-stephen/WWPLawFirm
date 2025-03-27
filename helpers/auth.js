const bcrypt = require('bcryptjs');

// Fungsi untuk hash password
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Error hashing password');
    }
};

// Fungsi untuk compare password
const comparePassword = async (password, hashed) => {
    try {
        return await bcrypt.compare(password, hashed);
    } catch (error) {
        console.error('Error comparing password:', error);
        throw new Error('Error comparing password');
    }
};

module.exports = {
    hashPassword,
    comparePassword
};