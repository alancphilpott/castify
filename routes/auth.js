const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const { User } = require("../models/user");
const validate = require("../middleware/validate");

router.post("/", validate(validateLogin), async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid Email or Password");

    if (!(await bcrypt.compare(req.body.password, user.password)))
        return res.status(400).send("Invalid Email or Password");

    const token = user.generateAuthToken();
    res.header("x-auth-token", token).send(
        _.pick(user, ["_id", "name", "email"])
    );
});

function validateLogin(req) {
    const schema = Joi.object({
        email: Joi.string().min(6).max(100).required(),
        password: Joi.string().min(8).max(50).required()
    });
    return schema.validate(req);
}

module.exports = router;
