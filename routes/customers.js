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

router.get();

router.get();

router.post();

router.put();

router.delete();

module.exports = router;
