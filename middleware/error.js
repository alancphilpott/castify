function error(error, req, res, next) {
    res.status(500).send("Something Went Wrong Mate");
}

module.exports = error;
