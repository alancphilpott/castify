const request = require("supertest");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const { Customer } = require("../../../models/customer");

describe("/api/customers", () => {
    const endpoint = "/api/customers/";

    let server;

    beforeEach(async () => {
        server = require("../../../index");
    });

    afterEach(async () => {
        await Customer.deleteMany({});
        await server.close();
    });

    describe("GET /", () => {
        const exec = () => {
            return request(server).get(endpoint).send();
        };

        it("should return 404 if no customers exist", async () => {
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it("should return all customers", async () => {
            await Customer.insertMany([
                { name: "Customer 1", phone: "123456789" },
                { name: "Customer 2", phone: "123456789" }
            ]);
            const res = await exec();
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some((c) => c.name == "Customer 1")).toBeTruthy();
            expect(res.body.some((c) => c.name == "Customer 2")).toBeTruthy();
        });
    });

    describe("GET /:id", () => {
        let customer, customerId;

        const exec = () => {
            return request(server)
                .get(endpoint + customerId)
                .send();
        };

        beforeEach(async () => {
            customer = new Customer({ name: "1234", phone: "123456" });
            await customer.save();

            customerId = customer._id;
        });

        it("should return 400 if invalid id is passed", async () => {
            customerId = "1";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 404 if no customers exist", async () => {
            customerId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it("should return a customer if valid id is passed", async () => {
            const res = await exec();
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "name", "phone"])
            );
        });
    });

    describe("POST /", () => {
        let payload, token;

        const exec = () => {
            return request(server)
                .post(endpoint)
                .set("x-auth-token", token)
                .send(payload);
        };

        beforeEach(() => {
            payload = {
                name: "1234",
                phone: "123456"
            };
            token = new User().generateAuthToken();
        });

        it("should return 401 if auth token not provided", async () => {
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it("should return 400 if name is less than 4 characters", async () => {
            payload.name = "123";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if name is more than 50 characters", async () => {
            payload.name = new Array(52).join("a");
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if phone is less than 6 characters", async () => {
            payload.phone = "12345";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if phone is more than 50 characters", async () => {
            payload.phone = new Array(52).join("a");
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if customer already exists", async () => {
            const customer = new Customer({
                name: "1234",
                phone: "123456"
            });
            await customer.save();
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return customer if input is valid", async () => {
            const res = await exec();
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "name", "phone"])
            );
        });
    });

    describe("PUT /:id", () => {
        let payload, token;
        let customer, customerId;
        let name, phone;

        const exec = () => {
            return request(server)
                .put(endpoint + customerId)
                .set("x-auth-token", token)
                .send({ name, phone });
        };

        beforeEach(async () => {
            customer = new Customer({
                name: "Customer 1",
                phone: "123456789"
            });
            await customer.save();
            customerId = customer._id;

            token = new User().generateAuthToken();

            name = "Updated Customer";
            phone = "1234567890";
        });

        it("should return 401 if auth token not provided", async () => {
            token = "";
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it("should return 400 if invalid if is passed", async () => {
            customerId = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if name is less than 4 characters", async () => {
            name = "123";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if name is more than 50 characters", async () => {
            name = new Array(52).join("a");
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if phone is less than 6 characters", async () => {
            phone = "12345";
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should return 400 if phone is more than 50 characters", async () => {
            phone = new Array(52).join("a");
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it("should update customer if it is valid", async () => {
            await exec();
            const customerInDb = await Customer.findOne({ name });
            expect(customerInDb).not.toBeNull();
        });

        it("should return updated movie in body of response", async () => {
            const res = await exec();
            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(["_id", "name", "phone"])
            );
            expect(res.body).toHaveProperty("name", name);
        });
    });
});
