const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// const catchAsync = require('../utils/catchAsync');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  //users will have unique emails, not names
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, //will not show up when we query for all the users
  },
  lastFailedAttempt: Date,
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password; // validator returns true if the statement is true, if false we get validation error
      },
      message: 'Passwords are not the same', //if validation error (false) happens then this is the error message
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  this.passwordChangedAt = Date.now() - 1000; // we use passwordChangedAt to compare with the timestamp when the jwt was created
  next();
});

userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance method - available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
  // returns true or false
  // candidatePassword is not hashed and userPassword is hashed
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp; // 100 < 200, changed the password after the token was issued
  }
  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // token is created, it is not encrypted, it is 32 characters hexadecimal string, this is the token we send to user email to reset an account password

  this.passwordResetToken = crypto // passwordResetToken is a field in a database (field in mongoose model)
    .createHash('sha256') // sha256 is the hashing algorithm
    .update(resetToken) // making token encyrpted and saving it to passwordResetToken
    .digest('hex'); // storing the token as hexadecimal

  console.log({ resetToken }, this.passwordResetToken); // logging as object so variable name and value are visible

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // token expires 10 minutes after creation

  return resetToken; // we send the unencrypted token version to a user, encrypted version is saved in a database, token is valid for 10 minutes
};

const User = mongoose.model('User', userSchema); // variable is User, User is the model name made of userSchema

module.exports = User;
