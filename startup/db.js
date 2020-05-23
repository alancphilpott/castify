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
            useUnifiedTopology: true
        })
        .then(() => {
            winston.info(`Connected to ${db}`);
            console.log(`***DEBUG***: Connected to ${db}`);
        });
};
