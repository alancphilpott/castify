const express = require("express");
const router = express.Router();
const moment = require("moment");
const auth = require("../middleware/auth");
const { Movie } = require("../models/movie");
const { Rental } = require("../models/rental");

router.post("/", auth, async (req, res) => {
    if (!req.body.customerId)
        return res.status(400).send("No CustomerId Provided");
    if (!req.body.movieId) return res.status(400).send("No MovieId Provided");

    const rental = await Rental.findOne({
        "customer._id": req.body.customerId,
        "movie._id": req.body.movieId
    });
    if (!rental) return res.status(404).send("Rental Not Found");

    if (rental.dateIn) res.status(400).send("Rental Already Processed");

    rental.dateIn = new Date();
    await rental.save();

    res.status(200).send();
});

module.exports = router;
