const express = require("express");
const router = express.Router();
const { Rental } = require("../models/rental");

router.post("/", async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Unauthorized");

    if (!req.body.customerId) res.status(400).send("No CustomerId Provided");
    if (!req.body.movieId) res.status(400).send("No MovieId Provided");

    const rental = await Rental.findOne({
        customerId: req.body.customerId,
        movieId: req.body.movieId
    });
    if (!rental) return res.status(404).send("Rental Not Found");
});

module.exports = router;
