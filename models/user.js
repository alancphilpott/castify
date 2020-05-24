const Joi = require("@hapi/joi");
const config = require("config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 4,
        maxlength: 50,
        required: true
    },
    email: {
        type: String,
        minlength: 6,
        maxlength: 100,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 1024,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { _id: this._id, isAdmin: this.isAdmin },
        config.get("jwtPrivateKey")
    );
};

userSchema.methods.encrypt = async function (password) {
    this.password = await bcrypt.hash(password, await bcrypt.genSalt(10));
    console.log(this.password);
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(4).max(50).required(),
        email: Joi.string().min(6).max(100).required(),
        password: Joi.string().min(8).max(50).required(),
        isAdmin: Joi.boolean()
    });
    return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
