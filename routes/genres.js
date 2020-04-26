const Joi = require("joi");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        maxlength: 50,
    },
});

const Genre = mongoose.model("Genre", genreSchema);
