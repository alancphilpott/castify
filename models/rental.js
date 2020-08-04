const Joi = require("@hapi/joi");
const moment = require("moment");
const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            isGold: {
                type: Boolean,
                default: false
            },
            name: {
                type: String,
                required: true,
                minlength: 4,
                maxlength: 50
            },
            phone: {
                type: String,
                required: true,
                minlength: 6,
                maxlength: 50
            }
        }),
        required: true
    },
    movie: {
        type: new mongoose.Schema({
            title: {
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 255
            },
            dailyRentalRate: {
                type: Number,
                min: 0,
                max: 255,
                default: 0
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        default: Date.now,
        required: true
    },
    dateIn: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }
});

rentalSchema.statics.lookup = function (rentalId, customerId, movieId) {
    return this.findOne({
        _id: rentalId,
        "customer._id": customerId,
        "movie._id": movieId
    });
};

rentalSchema.methods.return = function () {
    this.dateIn = new Date();

    this.rentalFee = this.customer.isGold
        ? moment().diff(this.dateOut, "days") *
          this.movie.dailyRentalRate *
          0.75
        : moment().diff(this.dateOut, "days") * this.movie.dailyRentalRate;
};

const Rental = mongoose.model("Rental", rentalSchema);

function validateRental(rental) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
    return schema.validate(rental);
}

exports.Rental = Rental;
exports.validateRental = validateRental;
