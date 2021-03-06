const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Genre } = require("../models/genre");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const { Movie, validateMovie } = require("../models/movie");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/", async (req, res) => {
    const movies = await Movie.find().sort({ name: 1 });
    if (movies.length === 0) return res.status(404).send("No Movies Found");
    res.send(movies);
});

router.get("/:id", validateObjectId, async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Movie Not Found");
    res.send(movie);
});

router.post("/", [auth, validate(validateMovie)], async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(404).send("Genre Does Not Exist");

    const newMovie = new Movie({
        title: req.body.title,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
        genre: {
            _id: genre._id,
            name: genre.name
        }
    });

    await newMovie.save();
    res.send(newMovie);
});

router.put(
    "/:id",
    [auth, validate(validateMovie), validateObjectId],
    async (req, res) => {
        const genre = await Genre.findById(req.body.genreId);
        if (!genre) return res.status(404).send("Genre Does Not Exist");

        let movie = await Movie.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                numberInStock: req.body.numberInStock,
                dailyRentalRate: req.body.dailyRentalRate,
                genre: {
                    _id: genre._id,
                    name: genre.name
                }
            },
            { new: true }
        );
        if (!movie) return res.status(404).send("Movie Not Found");
        res.send(movie);
    }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) return res.status(404).send("Movie ID Not Found");
    res.send(movie);
});

module.exports = router;
