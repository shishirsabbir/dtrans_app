// imports
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        minLength: 5,
        required: [true, 'username is required'],
    },
    nickname: {
        type: String,
        minLength: 5,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'not a valid email'],
        required: [true, 'email is required'],
    },
    password: {
        type: String,
        minLength: 8,
        select: false,
        required: [true, 'password is required'],
    },
    password_confirm: {
        type: String,
        required: [true, 'password confirmation is required'],
        validate: {
            validator: function (value) {
                return this.password === value;
            },
            message: 'passwords are not the same',
        },
    },
    photo: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    created_at: {
        type: Date,
        default: Date.now(),
        select: false,
    },
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    password_change_date: Date,
    password_reset_token: String,
    password_reset_expires: Date,
});

// mongoose middleware (document middleware)
// password hashing
userSchema.pre('save', async function (next) {
    // only run this function if password was actually modified
    if (!this.isModified('password')) {
        return next();
    }
    // hashing the password with the cost of 10
    this.password = await bcrypt.hash(this.password, 10);

    // delete password_confirm field
    this.password_confirm = undefined;

    next();
});

// password reset
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }

    this.password_change_date = Date.now() - 1000;
    next();
});

// mongoose middleware (query middleware)
userSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

// mongoose methods
userSchema.methods.correctPassword = async function (
    candidate_password,
    user_password
) {
    return await bcrypt.compare(candidate_password, user_password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.password_change_date) {
        const changedTimeStamp = parseInt(
            this.password_change_date.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimeStamp;
    }

    // false means not changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.password_reset_token = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.password_reset_token);

    this.password_reset_expires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// model
const User = mongoose.model('User', userSchema);

// exports
module.exports = User;
