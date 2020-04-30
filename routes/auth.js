const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");

router.post("/", async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid Email or Password");

    if (!(await bcrypt.compare(req.body.password, user.password)))
        return res.status(400).send("Invalid Email or Password");

    res.send(true);
});

function validateLogin(req) {
    const schema = {
        email: Joi.string().min(6).max(100).required(),
        password: Joi.string().min(8).max(50).required()
    };
    return Joi.validate(req, schema);
}

module.exports = router;
