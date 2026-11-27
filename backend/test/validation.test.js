const test = require("node:test");
const assert = require("node:assert/strict");
const { validDate } = require("../validation");

test("accepts valid ISO calendar dates", () => {
  assert.equal(validDate("2024-02-29"), true);
  assert.equal(validDate("2026-11-27"), true);
});

test("rejects impossible and malformed dates", () => {
  assert.equal(validDate("2025-02-29"), false);
  assert.equal(validDate("2026-13-01"), false);
  assert.equal(validDate("2026-04-31"), false);
  assert.equal(validDate("27-11-2026"), false);
  assert.equal(validDate(""), false);
  assert.equal(validDate(null), false);
});
