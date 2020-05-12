const app = express();
const express = require("express");

require("./startup/logging")();
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/validation")();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening On Port ${port}...`);
});
