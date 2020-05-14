const winston = require("winston");

module.exports = function (error, req, res, next) {
    winston.error(error.message);
    res.status(500).send("Something Went Wrong Mate");
};
