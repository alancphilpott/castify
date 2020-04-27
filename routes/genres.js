const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require("joi");

const app = express();
app.use(express.json());

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        maxlength: 50
    }
});

const Genre = mongoose.model("Genre", genreSchema);

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
    const { error } = validateGenre(req.body);
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
    const { error } = validateGenre(req.body);
    if (error) {
        return res.status(404).send(error.details[0].message);
    }

    const course = await Genre.findByIdAndUpdate(req.params.id, {
        name: req.body.name
    });

    res.send(course);
});

// Delete & View Genre
router.delete("/:id", async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) return res.status(404).send("Genre ID Not Found");
    res.send(genre);
});

// Validate New Course
function validateGenre(genre) {
    const schema = {
        name: Joi.string().min(5).max(50).required()
    };
    return Joi.validate(genre, schema);
}
module.exports = router;
