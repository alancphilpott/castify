const mongoose = require("mongoose");
const Joi = require("joi");

const Movie = mongoose.model(
    "Movie",
    new mongoose.Schema({
        title: {
            type: String,
            required: true,
            minlength: 5,
            maxlength: 50
        },
        numberInStock: {
            type: Number,
            default: 0
        },
        dailyRentalRate: {
            type: Number,
            default: 0
        },
        genre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "genres"
        }
    })
);

function validateMovie(movie) {
    const schema = {
        title: Joi.string().minlength(5).maxlength(50).required(),
        numberInStock: Joi.number(),
        dailyRentalRate: Joi.number(),
        genre: Joi.required()
    };
    return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = this.validateMovie;
