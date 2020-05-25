const request = require("supertest");
const mongoose = require("mongoose");
const { Movie } = require("../../../models/movie");
const { Genre } = require("../../../models/genre");
const { User } = require("../../../models/user");

describe("/api/movies", () => {
    const endpoint = "/api/movies/";

    let server;

    beforeEach(async () => {
        server = require("../../../index");
    });
    afterEach(async () => {
        await server.close();
        await Movie.deleteMany({});
        await Genre.deleteMany({});
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

    describe("GET /:id", () => {
        let genre, movie;

        beforeEach(async () => {
            genre = new Genre({ name: "Genre 1" });
            await genre.save();

            movie = new Movie({ title: "Movie 1", genre: genre._id });
            await movie.save();
        });

        it("should return a movie if valid id is passed", async () => {
            const res = await request(server).get(endpoint + movie._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("title", movie.title);
        });

        it("should return 400 if invalid id is passed", async () => {
            const res = await request(server).get(endpoint + "1");
            expect(res.status).toBe(400);
        });

        it("should return 404 if no genre with given id exists", async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get(endpoint + id);
            expect(res.status).toBe(404);
        });
    });

    describe("POST /", () => {
        let token;
        let title;
        let genre, genreId;

        const execution = () => {
            return request(server)
                .post(endpoint)
                .set("x-auth-token", token)
                .send({ title, genreId });
        };

        beforeEach(async () => {
            genre = new Genre({ name: "Genre 1" });
            await genre.save();

            token = new User().generateAuthToken();

            title = "A Movie";
            genreId = genre._id;
        });

        it("should return 401 if client is not logged in", async () => {
            token = "";
            const res = await execution();
            expect(res.status).toBe(401);
        });

        it("should return 400 if title is less than 5 characters", async () => {
            title = "1234";
            const res = await execution();
            expect(res.status).toBe(400);
        });

        it("should return 400 if title is more than 255 characters", async () => {
            title = new Array(257).join("a");
            const res = await execution();
            expect(res.status).toBe(400);
        });

        it("should return 400 if genreId is not provided", async () => {
            genreId = "";
            const res = await execution();
            expect(res.status).toBe(400);
        });

        it("should return 404 if genre with given id not found", async () => {
            genreId = mongoose.Types.ObjectId();
            const res = await execution();
            expect(res.status).toBe(404);
        });
    });
});
