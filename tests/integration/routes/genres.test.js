const request = require("supertest");
const { User } = require("../../../models/user");
const { Genre } = require("../../../models/genre");
let server;
const endpoint = "/api/genres/";

describe("/api/genres", () => {
    beforeEach(() => {
        server = require("../../../index");
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
        let token;
        let name;

        const execution = async () => {
            return await request(server)
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
});
