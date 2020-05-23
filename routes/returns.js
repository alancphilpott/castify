const express = require("express");
const router = express.Router();
const moment = require("moment");
const Joi = require("@hapi/joi");
const auth = require("../middleware/auth");
const { Movie } = require("../models/movie");
const { Rental } = require("../models/rental");
const validate = require("../middleware/validate");

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
    if (!rental) return res.status(404).send("Rental Not Found");

    if (rental.dateIn) res.status(400).send("Rental Already Processed");

    rental.dateIn = new Date();
    const numOfDays = moment().diff(rental.dateOut, "days");
    rental.rentalFee = numOfDays * rental.movie.dailyRentalRate;
    await rental.save();

    await Movie.update(
        { _id: rental.movie._id },
        {
            $inc: {
                numberInStock: 1
            }
        }
    );

    res.status(200).send(rental);
});

function validateReturn(aReturn) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
    return schema.validate(aReturn);
}

module.exports = router;
