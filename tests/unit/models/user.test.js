const config = require("config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");

describe("user.generateAuthToken", () => {
    it("should return a valid JWT", () => {
        const payload = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            isAdmin: true
        };
        const user = new User(payload);
        const token = user.generateAuthToken();
        const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
        expect(decoded).toMatchObject(payload);
    });
});

describe("user.encrypt", () => {
    it("should successfully encrypt user password", async () => {
        const user = new User({
            name: "1234",
            email: "123456",
            password: "12345678"
        });
        await user.encrypt(user.password);
        const res = await bcrypt.compare("12345678", user.password);
        expect(res).toBeTruthy();
    });
});
