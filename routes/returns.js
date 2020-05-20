const express = require("express");
const router = express.Router();
const { Rental } = require("../models/rental");

router.post("/", async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Unauthorized");

    if (!req.body.customerId)
        return res.status(400).send("No CustomerId Provided");
    if (!req.body.movieId) return res.status(400).send("No MovieId Provided");

    const rental = await Rental.findOne({
        customer: req.body.customerId,
        movie: req.body.movieId
    });
    if (!rental) return res.status(404).send("Rental Not Found");
    if (rental.dateIn) res.status(400).send("Rental Already Processed");
});

module.exports = router;
