import { describe, expect, it } from "vitest";
import { indiaDate, indiaMinutes, indiaWeekStart, localDateKey } from "../utils/date";

describe("India timezone date helpers", () => {
  it("uses the India calendar date across UTC midnight", () => {
    expect(indiaDate(new Date("2026-11-27T18:30:00.000Z"))).toBe("2026-11-28");
  });

  it("returns the India local time in minutes", () => {
    expect(indiaMinutes(new Date("2026-11-27T18:30:00.000Z"))).toBe(0);
  });

  it("calculates the Sunday start of the Indian week", () => {
    expect(indiaWeekStart(new Date("2026-11-27T12:00:00.000Z"))).toBe("2026-11-22");
  });

  it("formats calendar dates without UTC conversion", () => {
    expect(localDateKey(new Date(2026, 10, 27))).toBe("2026-11-27");
  });
});
