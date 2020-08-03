const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const { Genre, validateGenre } = require("../models/genre");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/", async (req, res) => {
    const genres = await Genre.find().sort({ name: 1 });
    if (genres.length === 0) return res.status(404).send("No Existing Genres");
    res.send(genres);
});

router.get("/:id", validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send("Genre ID Not Found");
    res.send(genre);
});

router.post("/", [auth, validate(validateGenre)], async (req, res) => {
    const newGenre = new Genre({
        name: req.body.name
    });

    await newGenre.save();
    res.send(newGenre);
});

router.put("/:id", [auth, validateObjectId, validate(validateGenre)], async (req, res) => {
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

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) return res.status(404).send("Genre ID Not Found");
    res.send(genre);
});

module.exports = router;
