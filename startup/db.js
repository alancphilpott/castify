const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
    // Connect to MongoDB
    const db = config.get("db");
    mongoose.set("useCreateIndex", true);
    mongoose.set("useFindAndModify", false);
    mongoose
        .connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        })
        .then(() => {
            winston.info(`Connected to ${db}`);
        });
};
