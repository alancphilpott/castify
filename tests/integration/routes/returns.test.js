const moment = require("moment");
const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const { Movie } = require("../../../models/movie");
const { Rental } = require("../../../models/rental");

describe("/api/returns", () => {
    const endpoint = "/api/returns/";

    let server;
    let rental, movie;
    let customerId, movieId;
    let token, payload;

    const execution = () => {
        return request(server)
            .post(endpoint)
            .set("x-auth-token", token)
            .send(payload);
    };

    beforeEach(async () => {
        server = require("../../../index");
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        // Create a Movie
        movie = new Movie({
            _id: movieId,
            title: "12345",
            numberInStock: 9,
            dailyRentalRate: 2,
            genre: { name: "12345" }
        });
        await movie.save();

        // Create a Rental
        rental = new Rental({
            customer: {
                _id: customerId,
                name: "12345",
                phone: "123456"
            },
            movie: {
                _id: movieId,
                title: "12345",
                dailyRentalRate: 2
            }
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
        await execution();
        const rentalInDb = await Rental.findById(rental._id);
        const timeDiff = new Date() - rentalInDb.dateIn;
        expect(timeDiff).toBeLessThan(10 * 1000);
    });

    it("should calculate rental fee if input is valid", async () => {
        rental.dateOut = moment().add(-7, "days").toDate();
        await rental.save();
        await execution();
        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
    });

    it("should increase movie stock after rental is processed", async () => {
        rental.dateOut = moment().add(-7, "days").toDate();
        await rental.save();
        await execution();
        const movieInDb = await Movie.findById(movie._id);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it("should return the rental once processed", async () => {
        const res = await execution();
        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining([
                "dateOut",
                "dateIn",
                "rentalFee",
                "customer",
                "movie"
            ])
        );
    });
});
