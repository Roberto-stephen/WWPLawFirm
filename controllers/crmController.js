const fs = require('fs')
const getUserInfo = require('../helpers/getUserInfo');
const { DataNotExistError, UserNotSameError, DoNotHaveAccessError, PasswordNotSameError } = require('../helpers/exceptions');
const validator = require('validator');
const User = require('../models/user');
const mongoose = require('mongoose');
const { promisify } = require('util')
const Case = require('../models/case');
const unlinkAsync = promisify(fs.unlink)
const { userInfo } = require('os');
const { cloudinary } = require('../config/cloudinary');
const { hashPassword, comparePassword } = require('../helpers/auth')

// Fungsi validasi ObjectId
const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return mongoose.Types.ObjectId.isValid(id);
};

const createUser = async (req, res) => {
    console.log("Creating user with data:", req.body);
    
    const {
        username,
        email,
        password,
        avatar_url,
        type,
        number,      // Tambahkan field number
        address      // Tambahkan field address
    } = req.body

    try {
        // Log validation before creating user
        console.log("Validating user data...");
        
        // Create new user instance
        const new_user = new User({
            username,
            email,
            password,
            avatar_url,
            type,
            number,
            address
        });
        
        
        // Validate manually to see errors
        const validationError = new_user.validateSync();
        if (validationError) {
            console.error("Validation error:", validationError.errors);
            const validationErrors = {};

            for (const field in validationError.errors) {
                validationErrors[field] = validationError.errors[field].message;
            }

            return res.status(400).json({
                error: 'Validation failed',
                validationErrors,
            });
        }
        
        console.log("User validation passed, saving...");
        const new_entered_user = await new_user.save();

        if (!new_entered_user) {
            return res.json({
                error: 'No User uploaded'
            })
        }

        console.log("User created successfully:", new_entered_user._id);
        return res.status(200).send(new_user)
    } catch (error) {
        console.error("Error creating user:", error);

        if (error.code === 11000) {
            const fieldName = Object.keys(error.keyPattern)[0];
            let message = `Data ${fieldName} sudah terdaftar`;
            
            if (fieldName === 'email') {
                message = "Email sudah terdaftar. Gunakan email lain.";
            } else if (fieldName === 'number') {
                message = "Nomor telepon sudah terdaftar. Gunakan nomor lain.";
            }
            
            return res.status(400).json({
                error: 'DuplicateKey',
                message: message
            });
        }

        if (error instanceof mongoose.Error.ValidationError) {
            // Mongoose validation error
            const validationErrors = {};

            for (const field in error.errors) {
                if (!error.errors[field].message.includes("Cast to [ObjectId] failed for value"))
                    validationErrors[field] = error.errors[field].message;
            }

            return res.status(400).json({
                error: 'Validation failed',
                validationErrors,
            });
        }
        
        return res.status(500).json({
            error: error.name || "ServerError",
            message: error.message || "An unexpected error occurred"
        });
    }
}

const listSelectedUser = async (req, res) => {
    try {
        let { id } = req.params;
        
        // PERBAIKAN: gunakan req, bukan res
        const { userId, type } = getUserInfo(req);
        
        id = id === "self" ? userId : id;
        
        // Validasi format ID
        if (!isValidObjectId(id)) {
            console.error(`Invalid ID format: ${id}`);
            return res.status(400).json({
                error: "InvalidId",
                message: "User ID must be a valid MongoDB ObjectId (24 character hex string)"
            });
        }
        
        const selectedUser = await User.findById(new mongoose.Types.ObjectId(id));
        if (!selectedUser) {
            return res.status(404).json({
                error: "NotFound",
                message: "User does not exist"
            });
        }

        return res.status(200).send(selectedUser);
    } catch (error) {
        console.error("Error in listSelectedUser:", error);
        // Handle error sesuai jenisnya
        return res.status(500).json({
            error: error.name || "ServerError",
            message: error.message || "An unexpected error occurred"
        });
    }
}

const listUser = async (req, res) => {
    try {
        console.log("Listing users with client type");
        
        // Handle empty collection gracefully
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log("Users collection is empty");
            return res.status(200).json([]);
        }
        
        const allUser = await User.find({ type: "client" });
        
        // Safe handling for empty results
        if (!allUser || allUser.length === 0) {
            console.log("No client users found");
            return res.status(200).json([]);
        }
        
        // Sanitize user objects to ensure valid formats
        const sanitizedUsers = allUser.map(user => ({
            _id: user._id.toString(),
            username: user.username || '',
            email: user.email || '',
            type: user.type || 'client',
            avatar_url: user.avatar_url || '',
            number: user.number || '',
            address: user.address || ''
        }));
        
        console.log(`Found ${sanitizedUsers.length} client users`);
        return res.status(200).json(sanitizedUsers);
    } catch (error) {
        console.error("Error in listUser:", error);
        return res.status(500).json({
            error: error.name || "ServerError",
            message: error.message || "An unexpected error occurred"
        });
    }
}

const listEmployee = async (req, res) => {
    try {
        console.log("listEmployee: Starting to fetch employees");
        
        // Validasi token dan userId terlebih dahulu
        const userId = req.user?.userId || null;
        if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
            console.error(`listEmployee: Invalid userId format in token: ${userId}`);
            return res.status(400).json({
                error: "InvalidId",
                message: "User ID must be a valid MongoDB ObjectId (24 character hex string)"
            });
        }
        
        // Persiapan query dengan validasi
        let query = { type: {$ne: "client"} };
        
        // Eksekusi query dengan error handling yang robust
        let allUser;
        try {
            allUser = await User.find(query);
        } catch (dbError) {
            console.error("listEmployee: Database error:", dbError);
            return res.status(500).json({
                error: "DatabaseError",
                message: "Error querying employees from database"
            });
        }
        
        // Validasi hasil query
        if (!allUser) {
            console.log("listEmployee: No employees found (null result)");
            return res.status(200).json([]);
        }
        
        // Proses data untuk hasil akhir
        const sanitizedEmployees = allUser.map(user => ({
            _id: user._id.toString(),
            username: user.username || '',
            email: user.email || '',
            type: user.type || '',
            avatar_url: user.avatar_url || '',
            number: user.number || '',
            address: user.address || ''
        }));
        
        console.log(`listEmployee: Successfully found ${sanitizedEmployees.length} employees`);
        return res.status(200).json(sanitizedEmployees);
    } catch (error) {
        console.error("listEmployee: Unexpected error:", error);
        return res.status(500).json({
            error: error.name || "ServerError",
            message: error.message || "An unexpected error occurred"
        });
    }
};

const updateUser = async (req, res) => {
    let { id } = req.params
    // PERBAIKAN: Ubah dari res ke req
    const { userId, type } = getUserInfo(req)
    id = id === "self" ? userId : id
    let user_avatar;

    const selectUserID = type === "admin" ? id : userId;
    if (req.file) {
        const cloudinaryUploadedImage = await cloudinary.uploader.upload(req.file.path);
        user_avatar = cloudinaryUploadedImage.url;
        await unlinkAsync(req.file.path)
    }


    const {
        username,
        email,
        number,
        address,
    } = req.body

    const update = {
        username,
        email,
        type: req.body.type,
        number,
        address,
    }

    if (req.file) {
        update.avatar_url = user_avatar
    }
    console.log(update);
    try {

        const selectedUser = await User.findByIdAndUpdate(selectUserID,
            update, { new: true }
        )

        if (!selectedUser) {
            throw new DataNotExistError("User not exist")
        }

        return res.status(200).send(selectedUser)
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            // Mongoose validation error
            const validationErrors = {};

            for (const field in error.errors)
                validationErrors[field] = error.errors[field].message;

            return res.status(400).json({
                error: 'Validation failed',
                validationErrors,
            });
        } else {
            res.status(400).json({
                error: error.name,
                message: error.message
            })
        }
    }
}

const updatePassword = async (req, res) => {
    // PERBAIKAN: Ubah dari res ke req
    const { userId } = getUserInfo(req)

    const selectUserID = userId;

    const {
        oldpassword, newpassword
    } = req.body

    try {

        const hashedOldPassword = await hashPassword(oldpassword)
        const hashedNewPassword = await hashPassword(newpassword)

        /**
         * 
         * const uU = User.fOAU({
         *  _id : selectUserID,
         * password: 
         * }, update)
         */
        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(selectUserID) });
        if (!user) {
            return res.json({
                error: 'No user found'
            })
        }

        const match = await comparePassword(oldpassword, user.password)

        if (!match) {
            throw new PasswordNotSameError("Password Not Same")
        }
        else {
            const updatedUser = await User.findOneAndUpdate({
                _id: new mongoose.Types.ObjectId(selectUserID)
            }, { password: hashedNewPassword })

            if (!updatedUser) {
                throw new PasswordNotSameError("Password Not Same")
            }

            return res.status(200).send(updatedUser)
        }
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            // Mongoose validation error
            const validationErrors = {};

            for (const field in error.errors)
                validationErrors[field] = error.errors[field].message;

            return res.status(400).json({
                error: 'Validation failed',
                validationErrors,
            });
        } else {
            res.status(400).json({
                error: error.name,
                message: error.message
            })
        }
    }
}

const deleteUser = async (req, res) => {
    // PERBAIKAN: Ubah dari res ke req
    const { userId, type } = getUserInfo(req)
    const { id } = req.params

    const selectUserID = type === "admin" ? id : userId;

    try {

        const deletedUser = await User.findByIdAndDelete(selectUserID)
        if (!deletedUser)
            throw new DataNotExistError("User does not exist")

        return res.status(200).send(deletedUser)
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            // Mongoose validation error
            const validationErrors = {};

            for (const field in error.errors)
                validationErrors[field] = error.errors[field].message;

            return res.status(400).json({
                error: 'Validation failed',
                validationErrors,
            });
        } else {
            res.status(400).json({
                error: error.name,
                message: error.message
            })
        }
    }
}

module.exports = {
    createUser, listSelectedUser, listUser, updateUser, deleteUser, updatePassword, listEmployee
};