require("winston-mongodb");
const winston = require("winston");

module.exports = function () {
    // Handling Node Process Exceptions
    winston.exceptions.handle(
        new winston.transports.Console({ colorize: true, prettyPrint: true }),
        new winston.transports.File({ filename: "UE.log" })
    );
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
};
