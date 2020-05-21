const moment = require("moment");
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
    let token, payload;

    const execution = () => {
        return request(server)
            .post(endpoint)
            .set("x-auth-token", token)
            .send(payload);
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

        payload = { customerId, movieId };
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

    it("should return 400 if customerId is not provided", async () => {
        payload = { movieId };
        const res = await execution();
        expect(res.status).toBe(400);
    });

    it("should return 400 if movieId is not provided", async () => {
        payload = { customerId };
        const res = await execution();
        expect(res.status).toBe(400);
    });

    it("should return 404 if no rental is found for customer/movie", async () => {
        await Rental.deleteMany({});
        const res = await execution();
        expect(res.status).toBe(404);
    });

    it("should return 400 if return already processed", async () => {
        rental.dateIn = new Date();
        await rental.save();
        const res = await execution();
        expect(res.status).toBe(400);
    });

    it("should return 200 if valid rental is provided", async () => {
        const res = await execution();
        expect(res.status).toBe(200);
    });

    it("should set return date if input is valid", async () => {
        const res = await execution();
        const rentalInDb = await Rental.findById(rental._id);
        const timeDiff = new Date() - rentalInDb.dateIn;
        expect(timeDiff).toBeLessThan(10 * 1000);
    });
});
