const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const { User } = require("../models/user");

router.post("/", async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid Email or Password");

    if (!(await bcrypt.compare(req.body.password, user.password)))
        return res.status(400).send("Invalid Email or Password");

    const token = user.generateAuthToken();
    res.send(token);
});

function validateLogin(req) {
    const schema = Joi.object({
        email: Joi.string().min(6).max(100).required(),
        password: Joi.string().min(8).max(50).required()
    });
    return schema.validate(req);
}

module.exports = router;
