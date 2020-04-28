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
        title: Joi.string().minlength(5).maxlength(255).required(),
        numberInStock: Joi.number(),
        dailyRentalRate: Joi.number(),
        genreId: Joi.string().required()
    };
    return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = this.validateMovie;
