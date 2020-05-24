const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const { Genre } = require("../../../models/genre");

describe("/api/genres", () => {
    const endpoint = "/api/genres/";

    let server;

    beforeEach(async () => {
        server = require("../../../index");
    });
    afterEach(async () => {
        await server.close();
        await Genre.deleteMany({});
    });

    describe("GET /", () => {
        it("should return all genres", async () => {
            await Genre.collection.insertMany([
                { name: "Genre 1" },
                { name: "Genre 2" }
            ]);

            const res = await request(server).get(endpoint);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some((g) => g.name == "Genre 1")).toBeTruthy();
            expect(res.body.some((g) => g.name == "Genre 2")).toBeTruthy();
        });
    });

    describe("GET /:id", () => {
        it("should return a genre if valid id is passed", async () => {
            const genre = new Genre({ name: "Genre 1" });
            await genre.save();

            const res = await request(server).get(endpoint + genre._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", genre.name);
        });

        it("should return 404 if invalid id is passed", async () => {
            const res = await request(server).get(endpoint + "1");
            expect(res.status).toBe(404);
        });

        it("should return 404 if no genre with given id exists", async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get(endpoint + id);
            expect(res.status).toBe(404);
        });
    });

    describe("POST /", () => {
        let token;
        let name;

        const execution = () => {
            return request(server)
                .post(endpoint)
                .set("x-auth-token", token)
                .send({ name });
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = "Genre 1";
        });

        it("should return 401 if client is not logged in", async () => {
            token = "";
            const res = await execution();
            expect(res.status).toBe(401);
        });

        it("should return 400 if genre is less than 5 characters", async () => {
            name = "1234";
            const res = await execution();
            expect(res.status).toBe(400);
        });

        it("should return 400 if genre is more than 50 characters", async () => {
            name = new Array(52).join("a");
            const res = await execution();
            expect(res.status).toBe(400);
        });

        it("should save the genre if it is valid", async () => {
            await execution();
            const genre = await Genre.find({ name: "Genre 1" });
            expect(genre).not.toBeNull();
        });

        it("should return valid genre in body of response", async () => {
            const res = await execution();

            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", "Genre 1");
        });
    });

    describe("PUT /:id", () => {
        let token;
        let newName;
        let genre;
        let id;

        const execution = () => {
            return request(server)
                .put(endpoint + id)
                .set("x-auth-token", token)
                .send({ name: newName });
        };

        beforeEach(async () => {
            genre = new Genre({ name: "Genre 1" });
            await genre.save();

            token = new User().generateAuthToken();
            id = genre._id;
            newName = "New Genre 1";
        });

        it("should return 401 if client not logged in", async () => {
            token = "";
            const res = await execution();
            expect(res.status).toBe(401);
        });

        it("should return 404 if id is invalid", async () => {
            id = "1";
            const res = await execution();
            expect(res.status).toBe(404);
        });

        it("should return 400 if genre is less than 5 characters", async () => {
            newName = "1234";
            const res = await execution();
            expect(res.status).toBe(400);
        });

        it("should return 400 if genre is more than 50 characters", async () => {
            newName = new Array(52).join("a");
            const res = await execution();
            expect(res.status).toBe(400);
        });

        it("should return 404 if genre not found", async () => {
            id = mongoose.Types.ObjectId();
            const res = await execution();
            expect(res.status).toBe(404);
        });

        it("should update the genre if input is valid", async () => {
            await execution();
            const updatedGenre = await Genre.findById(genre._id);
            expect(updatedGenre.name).toBe(newName);
        });

        it("should return the updated genre if it is valid", async () => {
            const res = await execution();
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("name", newName);
        });
    });

    describe("DELETE /:id", () => {
        let token;
        let genre;
        let id;

        const execution = () => {
            return request(server)
                .delete(endpoint + id)
                .set("x-auth-token", token)
                .send();
        };

        beforeEach(async () => {
            genre = new Genre({ name: "Genre 1" });
            await genre.save();

            token = new User({ isAdmin: true }).generateAuthToken();
            id = genre._id;
        });

        it("should return 401 if client not logged in", async () => {
            token = "";
            const res = await execution();
            expect(res.status).toBe(401);
        });

        it("should return 403 if user is not admin", async () => {
            token = new User({ isAdmin: false }).generateAuthToken();
            const res = await execution();
            expect(res.status).toBe(403);
        });

        it("should return 404 if id is invalid", async () => {
            id = "1";
            const res = await execution();
            expect(res.status).toBe(404);
        });

        it("should return 404 if genre not found", async () => {
            id = mongoose.Types.ObjectId();
            const res = await execution();
            expect(res.status).toBe(404);
        });

        it("should delete the genre if input is valid", async () => {
            await execution();
            const genreInDB = await Genre.findById(genre._id);
            expect(genreInDB).toBeNull();
        });

        it("should return the updated genre if it is valid", async () => {
            const res = await execution();
            expect(res.body).toHaveProperty("_id", genre._id.toHexString());
            expect(res.body).toHaveProperty("name", genre.name);
        });
    });
});
