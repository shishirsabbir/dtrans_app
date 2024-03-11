// import
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');

// token create function
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// controllers
const signup = async (req, res) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            password_confirm: req.body.password_confirm,
        });

        // disabling password
        newUser.password = undefined;

        res.status(201).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                user: newUser,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            requestedAt: req.requestTime,
            message: err.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1) check if email and password exists
        if (!email || !password) {
            throw new Error('enter both email and password');
        }

        // 2) check if user exists and password is correct
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            throw new Error('enter correct email or password');
        }

        // 3) if everything is ok, send token to client
        const token = signToken(user._id);

        // 4) disable password before sending
        user.password = undefined;

        // 4) sending response with the token
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            token,
            data: {
                user,
            },
        });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.log(err);
        }

        res.status(401).json({
            status: 'fail',
            requestedAt: req.requestTime,
            message: err.message,
        });
    }
};

const protect = async (req, res, next) => {
    try {
        // 1) getting the token and check if it's there
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new Error('token not found');
        }

        // 2) verification token
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET_KEY
        );

        // 3) check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            throw new Error('user not found');
        }

        // 4) check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            throw new Error('password changed after jwt creation');
        }

        // 5) grand access to the protected routes
        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({
            status: 'fail',
            requestedAt: req.requestTime,
            message: err.message,
        });
    }
};

/*
const forgotPassword = async (req, res) => {
    // 1) get user based on posted email
    // 2) generate a random reset token
    // 3) send it to user's email
};
*/

// exports
module.exports = { signup, login, protect };
