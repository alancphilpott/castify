const express = require("express");
const mongoose = require("mongoose");
const genres = require("./routes/genres");
const customers = require("./routes/customers");

const app = express();

// Middleware
app.use(express.json());
app.use("/api/genres", genres);
app.use("/api/customers", customers);

// Connect to MongoDB
mongoose
    .connect("mongodb://localhost/castify", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Connected to MongoDB..."))
    .catch((error) => console.log(`Error: ${error}`));

// Listen on Port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening On Port ${port}...`);
});
