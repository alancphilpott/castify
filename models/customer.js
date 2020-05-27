const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const Customer = mongoose.model(
    "Customer",
    new mongoose.Schema({
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
    })
);

function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().min(4).max(50).required(),
        phone: Joi.string().min(6).max(50).required(),
        isGold: Joi.boolean()
    });
    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validateCustomer = validateCustomer;
