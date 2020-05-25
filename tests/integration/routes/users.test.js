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

    describe("POST /", () => {
        let payload;

        const exec = () => {
            return request(server).post(endpoint).send(payload);
        };

        beforeEach(() => {
            payload = {
                name: "1234",
                email: "123456",
                password: "12345678"
            };
        });

        it("should return 400 if name is less than 5 characters", async () => {
            payload.name = "";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if name is more than 50 characters", async () => {
            payload.name = new Array(52).join("a");
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if email is less than 6 characters", async () => {
            payload.email = "12345";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if email is more than 100 characters", async () => {
            payload.email = new Array(102).join("a");
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if password is less than 8 characters", async () => {
            payload.password = "1234567";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if password is more than 50 characters", async () => {
            payload.password = new Array(52).join("a");
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if user already exists", async () => {
            const user = new User({
                name: "1234",
                email: "123456",
                password: "12345678"
            });
            await user.save();
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return auth token in response header if input is valid", async () => {
            const res = await exec();
            expect(res.header).toHaveProperty("x-auth-token");
        });

        it("should return user if input is valid", async () => {
            const res = await exec();
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "name", "email"])
            );
        });
    });
});
