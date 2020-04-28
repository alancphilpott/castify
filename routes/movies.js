const express = require("express");
const router = express.Router();
const { Movie, validate } = require("../models/movie");

const app = express();
app.use(express.json());

router.get("/", async (req, res) => {
    const movies = Movie.find().sort({ name: 1 });
    if (movies.length === 0) return res.status(404).send("No Movies Found");
    res.send(movies);
});

router.get("/:id", async (req, res) => {
    const movie = Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Movie Not Found");
    res.send(movie);
});

router.post();

router.put();

router.delete();

module.exports = router;
