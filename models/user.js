const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const {Schema} = mongoose

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email tidak valid']
    },
    number: {
        type: String,
        unique: true,
        required: [true, "Contact Number is required"],
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    avatar_url: {
        type: String,
    },
    type: {
        type: String,
        enum: ['admin', 'client'], // Batasi tipe pengguna
        required: [true, "Type is required"],
    },
    rating: {
        type: mongoose.Schema.Types.Mixed // Sesuaikan dengan kebutuhan rating
    }
}, { 
    timestamps: true // Tambahkan createdAt dan updatedAt
});

// Middleware untuk hash password sebelum disimpan
userSchema.pre('save', async function(next) {
    // Hanya hash password jika dimodifikasi
    if (!this.isModified('password')) return next();

    try {
        // Generate salt
        const salt = await bcrypt.genSalt(10);
        
        // Hash password
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Metode untuk validasi password
userSchema.methods.validatePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;