import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CheckInOut from "../pages/employee/CheckInOut";
import api from "../api/axios";

vi.mock("../api/axios");

describe("CheckInOut Page", () => {

  it("renders check in and check out buttons after loading attendance", async () => {

    api.get.mockResolvedValue({
      data: []
    });

    render(<CheckInOut />);

    expect(
      await screen.findByRole("button", { name: /check in/i })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: /check out/i })
    ).toBeInTheDocument();

  });

});