const request = require("supertest");
const { User } = require("../../../models/user");
const { Genre } = require("../../../models/genre");
const { Movie } = require("../../../models/movie");
const { Rental } = require("../../../models/rental");
const { Customer } = require("../../../models/customer");

describe("/api/rentals", () => {
    let endpoint = "/api/rentals";

    let server;
    let genre;
    let movie;
    let customer;
    let token;

    beforeEach(async () => {
        server = require("../../../index");

        // Save a Genre
        genre = new Genre({ name: "A Genre" });
        await genre.save();

        // Save a Movie
        movie = new Movie({
            title: "A Movie",
            genre: genre._id,
            dailyRentalRate: 2
        });
        await movie.save();

        // Save a Customer
        customer = new Customer({
            name: "A Customer",
            phone: "123456789",
            isGold: true
        });
        await customer.save();

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
            await Customer.deleteMany({});
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

            await Rental.insertMany([
                {
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
                },
                {
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
                }
            ]);

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
});
