const express = require("express");
const router = express.Router();
const { Rental, validate } = require("../models/rental");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");

const app = express();
app.use(express.json());

router.get("/", async (req, res) => {
    const rentals = await Rental.find()
        .populate("customer", "_id name phone")
        .populate("movie", "_id title dailyRentalRate")
        .sort({ dateOut: 1 });
    if (rentals.length === 0) return res.status(404).send("No Rentals Found");
    res.send(rentals);
});

router.get("/:id", async (req, res) => {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(400).send("Invalid Rental ID");
    res.send(rental);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("Invalid Customer ID");

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("Invalid Movie ID");

    let rental = new Rental({
        customer: customer._id,
        movie: movie._id,
        rentalFee: movie.dailyRentalRate
    });

    console.log(rental);

    // movie.numberInStock--;
    // await movie.save();

    rental = await rental.save();
    res.send(rental);
});

module.exports = router;
