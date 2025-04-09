const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email tidak valid']
  },
  number: {
    type: String,
    required: [true, "Contact Number is required"],
    trim: true
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  avatar_url: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['admin', 'client', 'partner', 'associates', 'paralegal'],
    required: [true, "Type is required"]
  },
  rating: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual untuk total kasus
userSchema.virtual('totalCases', {
  ref: 'Case',
  localField: '_id',
  foreignField: 'client',
  count: true
});

// Virtual untuk kasus aktif
userSchema.virtual('activeCases', {
  ref: 'Case',
  localField: '_id',
  foreignField: 'client',
  count: true,
  match: { status: { $ne: 'closed' } }
});

// Indexes
// Baris userSchema.index({ email: 1 }); telah dihapus karena duplikasi dengan unique: true
userSchema.index({ type: 1 });
userSchema.index({ username: 'text', email: 'text' });

// Hash password sebelum disimpan
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
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