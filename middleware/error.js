const winston = require("winston");

function error(error, req, res, next) {
    winston.error(error.message);
    res.status(500).send("Something Went Wrong Mate");
}

module.exports = error;
