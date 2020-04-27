const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

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
        type: Number,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

const Customer = mongoose.model("Customer", customerSchema);

// Get All Customers
router.get("/", async (req, res) => {
    const customers = await Customer.find().sort({ name: 1 });
});

// Get a Customer
router.get();

// Create a Customer
router.post();

// Update a Customer
router.put();

// Delete a Customer
router.delete();

module.exports = router;
