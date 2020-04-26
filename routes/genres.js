const Joi = require("joi");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

mongoose
    .connect("mongodb://localhost/castify", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB..."))
    .catch((error) => console.log(`Error: ${error}`));
