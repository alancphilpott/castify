const request = require("supertest");
const { User } = require("../../../models/user");
const { Genre } = require("../../../models/genre");

describe("auth middleware", () => {
    const endpoint = "/api/genres";

    let server;
    let token;

    beforeEach(() => {
        server = require("../../../index");
        token = new User().generateAuthToken();
    });

    afterEach(async () => {
        await Genre.deleteMany({});
        await server.close();
    });

    const execution = () => {
        return request(server)
            .post(endpoint)
            .set("x-auth-token", token)
            .send({ name: "Genre 1" });
    };

    it("should return 401 if no token is provided", async () => {
        token = "";
        const res = await execution();
        expect(res.status).toBe(401);
    });

    it("should return 400 if token is invalid", async () => {
        token = "a";
        const res = await execution();
        expect(res.status).toBe(400);
    });

    it("should return 200 if token is valid", async () => {
        const res = await execution();
        expect(res.status).toBe(200);
    });
});
