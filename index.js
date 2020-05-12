const app = express();
const Joi = require("joi");
const express = require("express");
Joi.objectId = require("joi-objectid")(Joi);

require("./startup/logging")();
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening On Port ${port}...`);
});
