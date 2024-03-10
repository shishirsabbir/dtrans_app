// import
const jwt = require('jsonwebtoken');
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

        // 4) sending response with the token
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            token,
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

// exports
module.exports = { signup, login };
