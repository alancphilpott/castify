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

    // describe("PUT /admin/:id", () => {
    //     let adminToken, customerToken, customerId, adminId;

    //     const exec = () => {
    //         return request(server)
    //             .put(endpoint + "admin/" + customerId)
    //             .set("x-auth-token", adminToken)
    //             .send();
    //     };

    //     beforeEach(async () => {
    //         adminId = mongoose.Types.ObjectId();
    //         const adminCustomer = new Customer({
    //             _id: adminId,
    //             name: "1234",
    //             email: "adminEmail",
    //             password: "12345678",
    //             isAdmin: true
    //         });
    //         await adminCustomer.save();
    //         adminToken = adminCustomer.generateAuthToken();

    //         customerId = mongoose.Types.ObjectId();
    //         const customer = new Customer({
    //             _id: customerId,
    //             name: "1234",
    //             email: "customerEmail",
    //             password: "12345678"
    //         });
    //         customerToken = customer.generateAuthToken();
    //         await customer.save();
    //     });

    //     it("should return 401 if no token provided", async () => {
    //         adminToken = "";
    //         const res = await exec();
    //         expect(res.status).toBe(401);
    //     });

    //     it("should return 403 if client is not admin", async () => {
    //         adminToken = customerToken;
    //         const res = await exec();
    //         expect(res.status).toBe(403);
    //     });

    //     it("should return 404 if no customer is found", async () => {
    //         customerId = new mongoose.Types.ObjectId();
    //         const res = await exec();
    //         expect(res.status).toBe(404);
    //     });

    //     it("should return the updated customer with isAdmin set to true", async () => {
    //         const res = await exec();
    //         expect(Object.keys(res.body)).toEqual(
    //             expect.arrayContaining(["_id", "name", "email", "isAdmin"])
    //         );
    //         expect(res.body.isAdmin).toBeTruthy();
    //     });
    // });
});
