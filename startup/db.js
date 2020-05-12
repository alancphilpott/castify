const winston = require("winston");
const mongoose = require("mongoose");

module.exports = function () {
    // Connect to MongoDB
    // mongoose.set("useCreateIndex", true);
    mongoose
        .connect(
            "mongodb://localhost/castify"
            // {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true
            // }
        )
        .then(() => winston.info("Connected to MongoDB..."));
};
