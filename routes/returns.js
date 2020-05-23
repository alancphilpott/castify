const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const auth = require("../middleware/auth");
const { Movie } = require("../models/movie");
const { Rental } = require("../models/rental");
const validate = require("../middleware/validate");

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
    if (!rental) return res.status(404).send("Rental Not Found");

    if (rental.dateIn) return res.status(400).send("Rental Already Processed");

    rental.return();
    await rental.save();

    await Movie.updateOne(
        { _id: rental.movie._id },
        {
            $inc: {
                numberInStock: 1
            }
        }
    );

    res.send(rental);
});

function validateReturn(aReturn) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
    return schema.validate(aReturn);
}

module.exports = router;
