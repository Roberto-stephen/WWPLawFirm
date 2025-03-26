const bcrypt = require('bcrypt')

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (e, salt) => {
            if (e) reject(e)
            bcrypt.hash(password, salt, (e, hash) => {
                if (e) reject(e)
                resolve(hash)
            })
        })
    })
}

const comparePassword = async (password, hashedPassword) => {
    try {
        // Menggunakan bcrypt.compare untuk membandingkan password
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.error("Error comparing passwords:", error);
        return false;
    }
};

module.exports = { hashPassword, comparePassword }