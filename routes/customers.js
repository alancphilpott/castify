const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Joi = require("joi");

const app = express();
app.use(express.json());

const customerSchema = new mongoose.Schema({
    isGold: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

const Customer = mongoose.model("Customer", customerSchema);

// Get All Customers
router.get("/", async (req, res) => {
    const customers = await Customer.find().sort({ name: 1 });
    if (customers.length === 0) res.status(404).send("No Customers Found");
    res.send(customers);
});

// Get a Customer
router.get("/:id", async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) res.status(404).send("Customer ID Not Found");
    res.send(customer);
});

// Create a Customer
router.post("/", async (req, res) => {
    const { error } = validateCustomer(req.body);
    if (error) {
        return res.status(404).send(error.details[0].message);
    }

    let newCustomer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        number: req.body.number
    });

    newCustomer = await newCustomer.save();
    res.send(newCustomer);
});

// Update a Customer
router.put("/:id", async (req, res) => {
    const { error } = validateCustomer(req.body);
    if (error) {
        return res.status(404).send(error.details[0].message);
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        isGold: req.body.isGold,
        number: req.body.number
    });

    res.send(customer);
});

// Delete a Customer
router.delete("/:id", async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) {
        return res.status(404).send("Customer ID Not Found");
    }
    res.send(customer);
});

module.exports = router;
