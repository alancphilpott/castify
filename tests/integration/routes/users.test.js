const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");

describe("/api/users", () => {
    const endpoint = "/api/users/";

    let server;

    beforeEach(async () => {
        server = require("../../../index");
    });

    afterEach(async () => {
        await User.deleteMany({});
        await server.close();
    });

    describe("GET /me", () => {
        let token;
        let userId;

        const exec = () => {
            return request(server)
                .get(endpoint + "me")
                .set("x-auth-token", token)
                .send();
        };

        beforeEach(async () => {
            userId = mongoose.Types.ObjectId();
            const user = new User({
                _id: userId,
                name: "1234",
                email: "123456",
                password: "12345678"
            });
            await user.save();

            token = user.generateAuthToken();
        });

        it("should return 401 if no token is provided", async () => {
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it("should return user if auth token is provided", async () => {
            const res = await exec();
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "name", "email", "isAdmin"])
            );
        });
    });
});
