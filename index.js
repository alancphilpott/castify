require("express-async-errors");
const express = require("express");
const winston = require("winston");
const app = express();

require("./startup/logging")();
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/validation")();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    winston.info(`Listening On Port ${port}...`);
});

module.exports = server;
