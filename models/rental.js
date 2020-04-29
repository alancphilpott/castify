const mongoose = require("mongoose");
const Joi = require("Joi");

const Rental = mongoose.model(
    "Rental",
    new mongoose.Schema({
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true
        },
        dateOut: {
            type: Date,
            default: Date.now,
            required: true
        },
        dateIn: {
            type: Date
        },
        rentalFee: {
            type: Number,
            min: 0
        }
    })
);

function validateRental(rental) {
    const schema = {
        customerId: Joi.string().required(),
        movieId: Joi.string().required()
    };
    return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.validate = validateRental;
