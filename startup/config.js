const config = require("config");

module.exports = function () {
    // Check for JWT Secret Configuration
    if (!config.get("jwtPrivateKey")) {
        throw new Error("FATAL ERROR: JWT Secret Not Defined");
    }
};
