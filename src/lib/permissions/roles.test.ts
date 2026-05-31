import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireRole, requireUser } from "./roles";

const authMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() =>
  vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  })
);

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("authenticated role guards", () => {
  beforeEach(() => {
    authMock.mockReset();
    redirectMock.mockClear();
  });

  it("redirects anonymous users to login", async () => {
    authMock.mockResolvedValue(null);

    await expect(requireUser()).rejects.toThrow("redirect:/login");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("returns the session user when authenticated", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
        role: "USER",
      },
    });

    await expect(requireUser()).resolves.toMatchObject({
      id: "user-1",
      role: "USER",
    });
  });

  it("allows users with an accepted role", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "manager-1",
        role: "MANAGER",
      },
    });

    await expect(requireRole(["ADMIN", "MANAGER"])).resolves.toMatchObject({
      id: "manager-1",
      role: "MANAGER",
    });
  });

  it("redirects users without the required role", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        role: "USER",
      },
    });

    await expect(requireRole(["ADMIN"])).rejects.toThrow(
      "redirect:/unauthorized"
    );
    expect(redirectMock).toHaveBeenCalledWith("/unauthorized");
  });
});
