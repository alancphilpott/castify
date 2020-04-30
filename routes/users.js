const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User Already Exists");

    user = new User(_.pick(req.body, ["name", "email", "password"]));
    user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));

    await user.save();

    const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
    res.header("x-auth-token", token).send(
        _.pick(user, ["_id", "name", "email"])
    );
});

module.exports = router;
