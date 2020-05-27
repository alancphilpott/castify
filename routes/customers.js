const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const { Customer, validateCustomer } = require("../models/customer");

router.get("/", async (req, res) => {
    const customers = await Customer.find().sort({ name: 1 });
    if (customers.length === 0)
        return res.status(404).send("No Customers Found");
    res.send(customers);
});

router.get("/:id", validateObjectId, async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) res.status(404).send("Customer ID Not Found");
    res.send(customer);
});

router.post("/", [auth, validate(validateCustomer)], async (req, res) => {
    let customer = await Customer.findOne({ phone: req.body.phone });
    if (customer) return res.status(400).send("Customer Already Exists");

    const newCustomer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
    });

    await newCustomer.save();
    res.send(newCustomer);
});

router.put(
    "/:id",
    [auth, validateObjectId, validate(validateCustomer)],
    async (req, res) => {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                isGold: req.body.isGold,
                phone: req.body.phone
            },
            {
                new: true
            }
        );
        if (!customer) return res.status(404).send("Customer Not Found");
        res.send(customer);
    }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) {
        return res.status(404).send("Customer ID Not Found");
    }
    res.send(customer);
});

module.exports = router;
