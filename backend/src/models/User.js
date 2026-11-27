'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

const addressSchema = new mongoose.Schema({
  street:  { type: String, trim: true },
  city:    { type: String, trim: true },
  region:  { type: String, trim: true },
  country: { type: String, trim: true, default: 'Ethiopia' },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone:       { type: String, trim: true },
    password:    { type: String, required: true, minlength: 8, select: false },
    role: {
      type:    String,
      enum:    ['superAdmin', 'lotteryAdmin', 'cashManager', 'ticketAgent', 'customer'],
      default: 'customer',
    },
    status: {
      type:    String,
      enum:    ['active', 'suspended', 'deactivated'],
      default: 'active',
    },
    profilePhoto:          { type: String },
    dateOfBirth:           { type: Date },
    address:               { type: addressSchema },
    refreshToken:          { type: String, select: false },
    passwordResetToken:    { type: String, select: false },
    passwordResetExpires:  { type: Date,   select: false },
    lastLogin:             { type: Date },
    loginAttempts:         { type: Number, default: 0 },
    lockUntil:             { type: Date },
    createdBy:             { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ email: 1, status: 1 });

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt   = await bcrypt.genSalt(BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const rawToken            = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken   = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return rawToken;
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
