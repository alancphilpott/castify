const mongoose = require("mongoose");
const Joi = require("joi");
const { genreSchema } = require("./genre");

const Movie = mongoose.model(
    "Movie",
    new mongoose.Schema({
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 255
        },
        numberInStock: {
            type: Number,
            min: 0,
            max: 255,
            default: 0
        },
        dailyRentalRate: {
            type: Number,
            min: 0,
            max: 255,
            default: 0
        },
        genre: {
            type: genreSchema,
            required: true
        }
    })
);

function validateMovie(movie) {
    const schema = {
        title: Joi.string().min(5).max(255).required(),
        numberInStock: Joi.number().min(0).max(255),
        dailyRentalRate: Joi.number().min(0).max(255),
        genreId: Joi.objectId().required()
    };
    return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = validateMovie;
