const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (user)
        return res
            .status(400)
            .send("Email Already Registered. Forgot Password?");

    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    await newUser.save();
    res.send(newUser);
});

module.exports = router;
