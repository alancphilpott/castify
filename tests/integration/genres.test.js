const request = require("supertest");
const { User } = require("../../models/user");
const { Genre } = require("../../models/genre");
let server;
const endpoint = "/api/genres/";

describe("/api/genres", () => {
    beforeEach(() => {
        server = require("../../index");
    });
    afterEach(async () => {
        server.close();
        await Genre.remove({});
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
            genre.save();

            const res = await request(server).get(endpoint + genre._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", genre.name);
        });

        it("should return 404 if invalid id is passed", async () => {
            const res = await request(server).get(endpoint + "1");
            expect(res.status).toBe(404);
        });
    });

    describe("POST /", () => {
        it("should return 401 if client is not logged in", async () => {
            const res = await request(server)
                .post(endpoint)
                .send({ name: "Genre 1" });
            expect(res.status).toBe(401);
        });

        it("should return 400 if genre is less than 5 characters", async () => {
            const token = new User().generateAuthToken();

            const res = await request(server)
                .post(endpoint)
                .set("x-auth-token", token)
                .send({ name: "1234" });
            expect(res.status).toBe(400);
        });

        it("should return 400 if genre is more than 50 characters", async () => {
            const token = new User().generateAuthToken();
            const genreName = new Array(52).join("a");

            const res = await request(server)
                .post(endpoint)
                .set("x-auth-token", token)
                .send({ name: genreName });
            expect(res.status).toBe(400);
        });
    });
});
