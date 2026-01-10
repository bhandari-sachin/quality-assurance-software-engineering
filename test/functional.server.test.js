import * as chai from "chai";

import chaiHttp, { request } from "chai-http";
import app from "../src/simple-api/functional.server.js";

const { assert } = chai;

chai.use(chaiHttp);

describe("Functional: User registration and login", function () {
  it("Should allow a newly registered user to log in", async function () {
    // Step 1: Register a new user

    const registerRes = await request
      .execute(app)

      .post("/api/auth/register")

      .send({
        name: "Laura",

        email: "laura@test.com",

        password: "secret123",
      });

    assert.equal(registerRes.status, 201, "User should be created");

    // Step 2: Attempt to log in using the same credentials

    const loginRes = await request
      .execute(app)

      .post("/api/auth/login")

      .send({
        email: "laura@test.com",

        password: "secret123",
      });

    assert.equal(loginRes.status, 200, "Login should succeed");

    assert.containsAllKeys(
      loginRes.body,
      ["token"],
      "Login should return a token"
    );

    // Step 3: Access a protected route using the token

    const token = loginRes.body.token;

    const protectedRes = await request
      .execute(app)

      .get("/api/auth/profile")

      .set("Authorization", `Bearer ${token}`);

    assert.equal(protectedRes.status, 200);

    assert.equal(protectedRes.body.email, "laura@test.com");
  });
});
