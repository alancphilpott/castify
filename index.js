const express = require("express");
const genres = require("./routes/genres");
const mongoose = require("mongoose");

mongoose
    .connect("mongodb://localhost/castify", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB..."))
    .catch((error) => console.log(`Error: ${error}`));

const app = express();

app.use(express.json());
app.use("/api/genres", genres);

// LISTEN ON PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening On Port ${port}...`);
});
