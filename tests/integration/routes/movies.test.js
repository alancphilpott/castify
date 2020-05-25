const request = require("supertest");
const mongoose = require("mongoose");
const { Movie } = require("../../../models/movie");

describe("/api/movies", () => {
    const endpoint = "/api/movies/";

    let server;

    beforeEach(async () => {
        server = require("../../../index");
    });
    afterEach(async () => {
        await server.close();
        await Movie.deleteMany({});
    });

    describe("GET /", () => {
        it("should return 404 if no movies in db", async () => {
            await Movie.deleteMany({});
            const res = await request(server).get(endpoint);
            expect(res.status).toBe(404);
        });

        it("should return all movies", async () => {
            await Movie.collection.insertMany([
                { title: "Movie 1" },
                { title: "Movie 2" }
            ]);

            const res = await request(server).get(endpoint);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some((m) => m.title == "Movie 1")).toBeTruthy();
            expect(res.body.some((m) => m.title == "Movie 2")).toBeTruthy();
        });
    });
});
