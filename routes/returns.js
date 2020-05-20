const express = require("express");
const router = express.Router();
const { Rental } = require("../models/rental");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
    if (!req.body.customerId)
        return res.status(400).send("No CustomerId Provided");
    if (!req.body.movieId) return res.status(400).send("No MovieId Provided");

    const rental = await Rental.findOne({
        customer: req.body.customerId,
        movie: req.body.movieId
    });
    if (!rental) return res.status(404).send("Rental Not Found");

    if (rental.dateIn) res.status(400).send("Rental Already Processed");

    res.status(200).send();
});

module.exports = router;
