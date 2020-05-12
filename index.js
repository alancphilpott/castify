const app = express();
const Joi = require("joi");
const config = require("config");
const express = require("express");
Joi.objectId = require("joi-objectid")(Joi);

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();

// Check for JWT Secret Configuration
if (!config.get("jwtPrivateKey")) {
    console.error("FATAL ERROR: JWT Secret Not Defined");
    process.exit(1);
}

// Listen on Port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening On Port ${port}...`);
});
