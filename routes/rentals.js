const express = require("express");
const router = express.Router();
const Fawn = require("fawn");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { Movie } = require("../models/movie");
const admin = require("../middleware/admin");
const { Customer } = require("../models/customer");
const validate = require("../middleware/validate");
const { Rental, validateRental } = require("../models/rental");
const validateObjectId = require("../middleware/validateObjectId");

Fawn.init(mongoose);

router.get("/", auth, async (req, res) => {
    const rentals = await Rental.find().sort({ dateOut: 1 });
    if (rentals.length === 0) return res.status(404).send("No Rentals Found");
    res.send(rentals);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).send("Rental Not Found");
    res.send(rental);
});

router.post("/", [auth, admin, validate(validateRental)], async (req, res) => {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("Invalid Customer");

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("Invalid Movie");

    if (movie.numberInStock === 0)
        return res.status(400).send("Movie Not In Stock");

    const rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    await Fawn.Task()
        .save("rentals", rental)
        .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
        .run();
    res.send(rental);
});

module.exports = router;
