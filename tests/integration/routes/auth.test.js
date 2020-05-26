const request = require("supertest");
const { User } = require("../../../models/user");

describe("/api/auth/", () => {
    let server;
    let endpoint = "/api/auth/";
    let user;
    let email, password;

    beforeEach(async () => {
        server = require("../../../index");

        user = new User({
            name: "User",
            email: "example@example.com",
            password: "password"
        });
        user.encrypt(user.password);
        user.save();

        email = "example@example.com";
        password = "password";
    });

    afterEach(async () => {
        await User.deleteMany({});
        await server.close();
    });

    const exec = () => {
        return request(server).post(endpoint).send({ email, password });
    };

    it("should return 400 if email is less than 6 characters", async () => {
        email = "12345";
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it("should return 400 if email is more than 100 characters", async () => {
        email = Array(102).join("a");
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it("should return 400 if password is less than 8 characters", async () => {
        password = "12345";
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it("should return 400 if password is more than 50 characters", async () => {
        password = Array(52).join("a");
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it("should return 400 if email address is not found", async () => {
        email = "email@email.com";
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it("should return 400 if password is incorrect", async () => {
        password = "wrong-password";
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it("should return auth token in header of response when valid credentials supplied", async () => {
        const res = await exec();
        expect(res.header).toHaveProperty("x-auth-token");
    });
});
