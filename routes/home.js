const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index", {
        title: "Castify - Movie Rental API",
        header: "Castify - Movie Rental API",
        message: "Welcome. This API was built using the Express framework."
    });
});

module.exports = router;
