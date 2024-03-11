// imports
const mongoose = require('mongoose');

// schema
const transSchema = new mongoose.Schema({
    payer: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'payer info is required'],
    },
    payment: {
        amount: {
            type: Number,
            required: [true, 'transection amount required'],
        },
        payee: {
            type: String,
            required: [true, 'payee name required'],
            lowercase: true,
            minlength: 4,
        },
        self_part: {
            type: Number,
            required: [true, 'amount part is required'],
        },
        other_part: {
            type: Number,
            // required: [true, 'amount part is required'],
        },
        // photo: {
        //     type: String,
        // },
        purpose: {
            type: String,
            trim: true,
            lowercase: true,
            required: [true, 'payment purpose is required'],
        },
    },
    paid_at: {
        type: Date,
        default: Date.now(),
    },
    settled: {
        type: Boolean,
        default: false,
    },
});

// mongoose middleware (document middleware)
transSchema.pre('save', function (next) {
    this.payment.other_part = this.payment.amount - this.payment.self_part;
    next();
});

// model
const Transection = mongoose.model('Transection', transSchema);

// exports
module.exports = Transection;
