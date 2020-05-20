const request = require("supertest");
const { User } = require("../../../models/user");
const { Genre } = require("../../../models/genre");
let server;
const endpoint = "/api/genres/";

describe("auth middleware", () => {
    beforeEach(() => {
        server = require("../../../index");
    });
    afterEach(async () => {
        server.close();
        await Genre.deleteMany({});
    });

    let token;

    const execution = async () => {
        return request(server)
            .post(endpoint)
            .set("x-auth-token", token)
            .send({ name: "Genre 1" });
    };

    beforeEach(() => {
        token = new User().generateAuthToken();
    });

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
