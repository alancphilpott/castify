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

        it("should save the movie if it is valid", async () => {
            await execution();
            const movie = await Movie.find({ name: "A Movie" });
            expect(movie).not.toBeNull();
        });

        it("should return valid movie in body of response", async () => {
            const res = await execution();
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "title", "genre"])
            );
            expect(res.body).toHaveProperty("title", "A Movie");
        });
    });

    describe("PUT /:id", () => {
        let token;
        let movie, movieId, newTitle;
        let genre, genreId;

        const execution = () => {
            return request(server)
                .put(endpoint + movieId)
                .set("x-auth-token", token)
                .send({ title: newTitle, genreId });
        };

        beforeEach(async () => {
            genre = new Genre({ name: "Genre 1" });
            await genre.save();
            genreId = genre._id;

            movie = new Movie({
                title: "A Movie",
                genre: {
                    _id: genreId,
                    name: genre.name
                }
            });
            await movie.save();
            movieId = movie._id;

            token = new User().generateAuthToken();
            newTitle = "A New Movie";
        });

        it("should return 401 if client is not logged in", async () => {
            token = "";
            const res = await execution();
            expect(res.status).toBe(401);
        });

        it("should return 400 if title is less than 5 characters", async () => {
            newTitle = "1234";
            const res = await execution();
            expect(res.status).toBe(400);
        });

        it("should return 400 if title is more than 255 characters", async () => {
            newTitle = new Array(257).join("a");
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

        it("should return 404 if movie with given id not found", async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await execution();
            expect(res.status).toBe(404);
        });

        it("should update the movie if it is valid", async () => {
            await execution();
            const updatedMovie = await Movie.find({ name: "A New Movie" });
            expect(movie).not.toBeNull();
        });

        it("should return valid movie in body of response", async () => {
            const res = await execution();
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "title", "genre"])
            );
            expect(res.body).toHaveProperty("title", "A New Movie");
        });
    });

    describe("DELETE /:id", () => {
        let token;
        let movie, movieId;
        let genre, genreId;

        const exec = () => {
            return request(server)
                .delete(endpoint + movieId)
                .set("x-auth-token", token)
                .send({ movieId });
        };

        beforeEach(async () => {
            genre = new Genre({ name: "A Genre" });
            await genre.save();
            genreId = genre._id;

            movie = new Movie({
                title: "A Movie",
                genre: {
                    _id: genreId,
                    name: genre.name
                }
            });
            await movie.save();
            movieId = movie._id;

            token = new User({ isAdmin: true }).generateAuthToken();
        });

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

        it("should return 404 if movie not found for given id", async () => {
            movieId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it("should delete movie if valid movieId is given", async () => {
            await exec();
            const deletedMovie = await Movie.find({ name: "A Movie" });
            expect(deletedMovie).toEqual(expect.arrayContaining([]));
        });

        it("should return deleted movie in body of response", async () => {
            const res = await exec();
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "title", "genre"])
            );
            expect(res.body).toHaveProperty("title", "A Movie");
        });
    });
});
