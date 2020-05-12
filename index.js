const config = require("config");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const express = require("express");
const mongoose = require("mongoose");
const winston = require("winston");
require("winston-mongodb");

const app = express();
require("./startup/routes")(app);

// Handling Node Process Exceptions
winston.exceptions.handle(new winston.transports.File({ filename: "UE.log" }));
process.on("unhandledRejection", (ex) => {
    throw ex;
});

// Add Winston Logging Transports
winston.add(new winston.transports.File({ filename: "logfile.log" }));
winston.add(
    new winston.transports.MongoDB({
        db: "mongodb://localhost/castify",
        level: "error",
        options: { useUnifiedTopology: true }
    })
);

// Check for JWT Secret Configuration
if (!config.get("jwtPrivateKey")) {
    console.error("FATAL ERROR: JWT Secret Not Defined");
    process.exit(1);
}

// Connect to MongoDB
mongoose.set("useCreateIndex", true);
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
