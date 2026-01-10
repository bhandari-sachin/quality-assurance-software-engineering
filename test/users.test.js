import * as chai from "chai";
import chaiHttp, { request } from "chai-http";

import app from "../src/simple-api/server.js";

chai.use(chaiHttp);

const { assert } = chai;

describe("Users API", () => {
  describe("GET /api/users", () => {
    it("should return all users", async () => {
      const res = await request.execute(app).get("/api/users");

      assert.equal(res.status, 200);
      assert.isArray(res.body, "Response body should be an array");
    });
  });

  describe("GET /api/users/count", () => {
    it("should return the count of users", async () => {
      const res = await request.execute(app).get("/api/users/count");
      assert.equal(res.status, 200);
      assert.isObject(res.body, "Response body should be an object");
      assert.containsAllKeys(
        res.body,
        ["count"],
        "Response body should contain 'count' key"
      );
      assert.isNumber(res.body.count, "'count' should be a number");
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const res = await request.execute(app).post("/api/users").send({
        name: "Charlie",
        email: "charlie@example.com",
      });
      assert.equal(res.status, 201);
      assert.isObject(res.body, "Response body should be an object");
      assert.containsAllKeys(
        res.body,
        ["id", "name", "email"],
        "Response body should contain 'id', 'name', and 'email' keys"
      );
      assert.equal(res.body.name, "Charlie", "Name should match the input");
      assert.equal(
        res.body.email,
        "charlie@example.com",
        "Email should match the input"
      );
    });
    it("should fail when required fields are missing", async () => {
      const res = await request.execute(app).post("/api/users").send({
        name: "Dave",
      });
      assert.equal(res.status, 400);
    });
    it("should not allow duplicate emails", async () => {
      const res1 = await request.execute(app).post("/api/users").send({
        name: "john",
        email: "john@example.com",
      });
      assert.equal(res1.status, 201);

      const res2 = await request.execute(app).post("/api/users").send({
        name: "john",
        email: "john@example.com",
      });
      assert.equal(res2.status, 409);
    });
  });

  describe("POST /api/users/:id", async () => {
    it("should return a user by its ID", async () => {
      const res = await request.execute(app).post("/api/users/1");
      assert.equal(res.status, 200);
      assert.isObject(res.body, "Response body should be an object");
      assert.containsAllKeys(
        res.body,
        ["id", "name", "email"],
        "Response body should contain 'id', 'name', and 'email' keys"
      );
      assert.equal(res.body.id, 1, "User ID should match the requested ID");
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update an existing user", async () => {
      const res = await request.execute(app).put("/api/users/1").send({
        name: "Alice Updated",
        email: "alice.updated@example.com",
      });
      assert.equal(res.status, 200);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user by its ID", async () => {
      const res = await request.execute(app).delete("/api/users/1");
      assert.equal(res.status, 200, "User should be deleted successfully");
    });
  });

  // Additional tests here...
});
