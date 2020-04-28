const express = require("express");
const router = express.Router();
const { Movie, validate } = require("../models/movie");
const { Genre } = require("../models/genre");

const app = express();
app.use(express.json());

router.get("/", async (req, res) => {
    const movies = await Movie.find().sort({ name: 1 });
    if (movies.length === 0) return res.status(404).send("No Movies Found");
    res.send(movies);
});

router.get("/:id", async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Movie Not Found");
    res.send(movie);
});

router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = Genre.find({
        name: { $eq: req.params.genre }
    });
    if (!genre) return res.status(404).send("Genre Does Not Exist");

    let newMovie = new Movie({
        title: req.body.title,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
        genre
    });

    newMovie = newMovie.save();
    res.send(newMovie);
});

router.put("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let movie = await Movie.findByIdAndUpdate(
        req.params.id,
        {
            title: req.body.title,
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate,
            $set: {
                "genre.name": req.body.genre.name
            }
        },
        { new: true }
    );

    res.send(movie);
});

router.delete();

module.exports = router;
