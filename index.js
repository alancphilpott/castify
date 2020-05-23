require("express-async-errors");
const config = require("config");
const express = require("express");
const winston = require("winston");
const app = express();

require("./startup/logging")();
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/validation")();
require("./startup/prod")(app);

const port = process.env.PORT || config.get("port");

const server = app.listen(port, () => {
    winston.info(`Listening On Port ${port}...`);
});

module.exports = server;
