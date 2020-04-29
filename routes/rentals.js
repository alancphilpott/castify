const express = require("express");
const router = express.Router();
const { Rental, validate } = require("../models/rental");

const app = express();
app.use(express.json());

router.get("/", async (req, res) => {
    const rentals = await Rental.find().sort({ dateOut: 1 });
    if (rentals.length === 0) return res.status(404).send("No Rentals Found");
    res.send(rentals);
});

module.exports = router;
