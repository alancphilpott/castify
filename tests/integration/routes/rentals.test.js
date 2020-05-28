const request = require("supertest");
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
    let rental;

    beforeEach(async () => {
        server = require("../../../index");

        // Save a Genre
        genre = new Genre({ name: "A Genre" });
        await genre.save();

        // Save a Movie
        movie = new Movie({ title: "A Movie", genre: genre._id });
        await movie.save();

        // Save a Customer
        customer = new Customer({ name: "A Customer", phone: "123456789" });
        await customer.save();
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
            return request(server).get(endpoint).send();
        };

        it("should return 404 if not rentals exist", async () => {
            const res = await exec();
            expect(res).toBe(404);
        });
    });
});
