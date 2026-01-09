import { assert } from "chai";
import { add, subtract } from "../src/unitTestingFunctions.js";

// Test

describe("Math functions", () => {
  it("add() should return 5 when 2 and 3 are passed", () => {
    const result = add(2, 3);
    assert.equal(result, 5);
  });

  it("subtract() should return 0 when 3 and 3 are passed", () => {
    const result = subtract(3, 3);
    assert.equal(result, 0);
  });
});
