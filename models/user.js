const mongoose = require("mongoose");
const Joi = require("joi");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        name: {
            type: String,
            minlength: 4,
            maxlength: 50,
            required: true
        },
        email: {
            type: String,
            minlength: 4,
            maxlength: 100,
            unique: true,
            required: true
        },
        password: {
            type: String,
            minlength: 8,
            maxlength: 1024,
            required: true
        }
    })
);

function validateUser(user) {
    const schema = {
        name: Joi.string().min(4).max(50).required(),
        email: Joi.string().min(4).max(100).required(),
        password: Joi.string().min(8).max(50).required()
    };
    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
