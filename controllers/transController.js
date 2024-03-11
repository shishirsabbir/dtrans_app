// imports
const Transection = require('./../models/transModel');

// controllers
const getAllTrans = async (req, res) => {
    try {
        const trans_array = await Transection.find({
            payer: req.user._id,
        });

        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                transections: trans_array,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            requestedAt: req.requestTime,
            message: err.message,
        });
    }
};

const createTrans = async (req, res) => {
    try {
        const newTrans = await Transection.create({
            payer: req.user._id,
            payment: { ...req.body },
        });

        res.status(201).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                transection: newTrans,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            requestedAt: req.requestTime,
            message: err.message,
        });
    }
};

// exports
module.exports = { getAllTrans, createTrans };
