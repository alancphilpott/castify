const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const { Genre } = require("../../../models/genre");
const { Movie } = require("../../../models/movie");
const { Rental } = require("../../../models/rental");
const { Customer } = require("../../../models/customer");

describe("/api/rentals", () => {
    let endpoint = "/api/rentals/";

    let server;
    let genre;
    let movie;
    let customer;
    let rental, rentalId;
    let token;

    beforeEach(async () => {
        server = require("../../../index");

        // Save a Genre
        genre = new Genre({ name: "A Genre" });
        await genre.save();

        // Save a Movie
        movie = new Movie({
            title: "A Movie",
            dailyRentalRate: 2,
            numberInStock: 10,
            genre: genre._id
        });
        await movie.save();

        // Save a Customer
        customer = new Customer({
            name: "A Customer",
            phone: "123456789",
            isGold: true
        });
        await customer.save();

        // Save a Rental
        rental = new Rental({
            customer: {
                _id: customer._id,
                name: customer.name,
                phone: customer.phone
            },
            movie: {
                _id: movie._id,
                title: movie.title,
                dailyRentalRate: movie.dailyRentalRate
            }
        });
        await rental.save();
        rentalId = rental._id;

        token = new User({ isAdmin: true }).generateAuthToken();
    });

    afterEach(async () => {
        await Genre.deleteMany({});
        await Movie.deleteMany({});
        await Rental.deleteMany({});
        await Customer.deleteMany({});
        await server.close();
    });

    describe("GET /", () => {
        const exec = () => {
            return request(server)
                .get(endpoint)
                .set("x-auth-token", token)
                .send();
        };

        it("should return 401 if no token provided", async () => {
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it("should return 404 if not rentals exist", async () => {
            await Rental.deleteMany({});
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it("should return all rentals", async () => {
            // Save a 2nd Customer
            let anotherCustomer = new Customer({
                name: "Another Customer",
                phone: "987654321"
            });
            await anotherCustomer.save();

            anotherRental = new Rental({
                customer: {
                    _id: anotherCustomer._id,
                    name: anotherCustomer.name,
                    phone: anotherCustomer.phone
                },
                movie: {
                    _id: movie._id,
                    title: movie.title,
                    dailyRentalRate: movie.dailyRentalRate
                }
            });
            await anotherRental.save();

            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(
                res.body.some((r) => r.customer._id == customer._id)
            ).toBeTruthy();
            expect(
                res.body.some((r) => r.customer._id == anotherCustomer._id)
            ).toBeTruthy();
        });
    });

    describe("GET /:id", () => {
        const exec = () => {
            return request(server)
                .get(endpoint + rentalId)
                .set("x-auth-token", token)
                .send();
        };

        it("should return 401 if no auth token provided", async () => {
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it("should return 400 if invalid id is provided", async () => {
            rentalId = "1";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 404 if no rental exists for given id", async () => {
            rentalId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it("should return valid rental in body of response", async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("customer.name", "A Customer");
            expect(res.body).toHaveProperty("movie.title", "A Movie");
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "customer", "movie"])
            );
        });
    });

    describe("POST /", () => {
        let payload;
        let anotherCustomer;

        beforeEach(async () => {
            anotherCustomer = new Customer({
                name: "Another Customer",
                phone: "987654321"
            });
            await anotherCustomer.save();

            payload = {
                customerId: anotherCustomer._id,
                movieId: movie._id
            };
        });

        const exec = () => {
            return request(server)
                .post(endpoint)
                .set("x-auth-token", token)
                .send(payload);
        };

        it("should return 401 if no auth token provided", async () => {
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it("should return 403 if user is not admin", async () => {
            token = new User().generateAuthToken();
            const res = await exec();
            expect(res.status).toBe(403);
        });

        it("should return 400 if customerId is not provided", async () => {
            payload.customerId = "";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if movieId is not provided", async () => {
            payload.movieId = "";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if customer id is not found", async () => {
            payload.customerId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if movie id is not found", async () => {
            payload.movieId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if chosen movie is not in stock", async () => {
            await Movie.updateOne(
                { _id: movie._id },
                {
                    $set: {
                        numberInStock: 0
                    }
                }
            );
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return valid rental in body of response", async () => {
            const res = await exec();
            expect(res.status).toBe(200);
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "customer", "movie", "dateOut"])
            );
            expect(res.body).toHaveProperty(
                "customer.name",
                "Another Customer"
            );
            expect(res.body).toHaveProperty("movie.title", "A Movie");
        });

        it("should decrease movie stock if rental is valid", async () => {
            await exec();
            const movieInDb = await Movie.findById(movie._id);
            expect(movieInDb.numberInStock).toBe(movie.numberInStock - 1);
        });
    });
});
