const express = require("express");
const router = express.Router();
const { Genre, validate } = require("../models/genre");

const app = express();
app.use(express.json());

// Get All Courses
router.get("/", async (req, res) => {
    const genres = await Genre.find().sort({ name: 1 });
    if (genres.length === 0) return res.status(404).send("No Genres Found");
    res.send(genres);
});

// Get A Course
router.get("/:id", async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send("Genre ID Not Found");
    res.send(genre);
});

// Create Genre
router.post("/", async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(404).send(error.details[0].message);
    }

    let newGenre = new Genre({
        name: req.body.name
    });

    newGenre = await newGenre.save();
    res.send(newGenre);
});

// Update Genre (Update First)
router.put("/:id", async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(404).send(error.details[0].message);
    }

    const genre = await Genre.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name
        },
        {
            new: true
        }
    );
    if (!genre) return res.status(404).send("Genre Not Found");
    res.send(genre);
});

// Delete & View Genre
router.delete("/:id", async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) return res.status(404).send("Genre ID Not Found");
    res.send(genre);
});

module.exports = router;
