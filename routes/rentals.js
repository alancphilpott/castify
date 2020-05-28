const express = require("express");
const router = express.Router();
const Fawn = require("fawn");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const { Movie } = require("../models/movie");
const admin = require("../middleware/admin");
const { Customer } = require("../models/customer");
const { Rental, validate } = require("../models/rental");
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

router.post("/", [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

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

    try {
        await Fawn.Task()
            .save("rentals", rental)
            .update(
                "movies",
                { _id: movie._id },
                { $inc: { numberInStock: -1 } }
            )
            .run();
        res.send(rental);
    } catch (ex) {
        res.status(500).send("Interal Server Error");
    }
});

module.exports = router;
