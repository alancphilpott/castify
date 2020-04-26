const express = require("express");

const app = express();

app.use(express.json());

// LISTEN ON PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening On Port ${port}...`);
});
