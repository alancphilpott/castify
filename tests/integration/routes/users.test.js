const request = require("supertest");
const { User } = require("../../../models/user");

describe("/api/users", () => {
    const endpoint = "/api/users/";

    let server;

    beforeEach(async () => {
        server = require("../../../index");
    });

    afterEach(async () => {
        await server.close();
    });

    describe("GET /me", () => {
        let token;

        const exec = () => {
            return request(server)
                .get(endpoint + "me")
                .set("x-auth-token", token)
                .send();
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
        });

        it("should return 401 if no token is provided", async () => {
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });
    });
});
