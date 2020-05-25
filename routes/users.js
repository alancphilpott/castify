const express = require("express");
const router = express.Router();
const _ = require("lodash");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const { User, validateUser } = require("../models/user");

router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.send(user);
});

router.post("/", validate(validateUser), async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User Already Exists");

    user = new User(_.pick(req.body, ["name", "email", "password"]));
    await user.encrypt(user.password);
    await user.save();

    const token = user.generateAuthToken();
    res.header("x-auth-token", token).send(
        _.pick(user, ["_id", "name", "email"])
    );
});

router.put("/admin/:id", [auth, admin], async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            isAdmin: true
        },
        {
            new: true
        }
    );
    if (!user) return res.status(404).send("User Not Found");
    res.send(_.pick(user, ["_id", "name", "email", "isAdmin"]));
});

module.exports = router;
