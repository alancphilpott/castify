const express = require("express");
const router = express.Router();
const { Customer, validate } = require("../models/customer");
const auth = require("../middleware/auth");

const app = express();
app.use(express.json());

router.get("/", async (req, res) => {
    const customers = await Customer.find().sort({ name: 1 });
    if (customers.length === 0)
        return res.status(404).send("No Customers Found");
    res.send(customers);
});

router.get("/:id", async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) res.status(404).send("Customer ID Not Found");
    res.send(customer);
});

router.post("/", auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(404).send(error.details[0].message);
    }

    const newCustomer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
    });

    await newCustomer.save();
    res.send(newCustomer);
});

router.put("/:id", auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(404).send(error.details[0].message);
    }

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
});

router.delete("/:id", auth, async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) {
        return res.status(404).send("Customer ID Not Found");
    }
    res.send(customer);
});

module.exports = router;
