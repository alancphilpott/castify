const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Genre, validate } = require("../models/genre");

router.get("/", async (req, res, next) => {
    const genres = await Genre.find().sort({ name: 1 });
    if (genres.length === 0) return res.status(404).send("No Genres Found");
    res.send(genres);
});

router.get("/:id", async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send("Genre ID Not Found");
    res.send(genre);
});

router.post("/", auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const newGenre = new Genre({
        name: req.body.name
    });

    await newGenre.save();
    res.send(newGenre);
});

router.put("/:id", auth, async (req, res) => {
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

router.delete("/:id", [auth, admin], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) return res.status(404).send("Genre ID Not Found");
    res.send(genre);
});

module.exports = router;
