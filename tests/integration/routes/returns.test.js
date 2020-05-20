const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const { Movie } = require("../../../models/movie");
const { Rental } = require("../../../models/rental");
const { Customer } = require("../../../models/customer");

describe("/api/returns", () => {
    const endpoint = "/api/returns/";

    let server;
    let rental;
    let customer, customerId;
    let movie, movieId;
    let token;

    const execution = () => {
        return request(server)
            .post(endpoint)
            .set("x-auth-token", token)
            .send({ customerId, movieId });
    };

    beforeEach(async () => {
        server = require("../../../index");
        token = new User().generateAuthToken();

        // Create a Rental
        customerId = mongoose.Types.ObjectId();
        customer = new Customer({
            _id: customerId,
            name: "1234",
            phone: "123456"
        });

        movieId = mongoose.Types.ObjectId();
        movie = new Movie({
            _id: movieId,
            title: "12345",
            dailyRentalRate: 2
        });

        rental = new Rental({
            customer: customer._id,
            movie: movie._id
        });
        await rental.save();
    });

    afterEach(async () => {
        await server.close();
        await Rental.deleteMany({});
        await Movie.deleteMany({});
    });

    it("should return 401 if client not logged in", async () => {
        token = "";
        const res = await execution();
        expect(res.status).toBe(401);
    });
});
