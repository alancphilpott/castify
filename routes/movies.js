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

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(404).send("Genre Does Not Exist");

    let newMovie = new Movie({
        title: req.body.title,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
        genre: {
            _id: genre._id,
            name: genre.name
        }
    });

    newMovie = await newMovie.save();
    res.send(newMovie);
});

router.put("/:id", async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

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
});

router.delete("/:id", async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) return res.status(404).send("Movie ID Not Found");
    res.send(movie);
});

module.exports = router;