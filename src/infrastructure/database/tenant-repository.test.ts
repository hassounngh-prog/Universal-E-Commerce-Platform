import { describe, expect, it, vi } from "vitest";
import { PrismaTenantRepository } from "./tenant-repository";
import { NotFoundError } from "@/shared/errors/platform-error";
import { Prisma } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockFindMany: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdateMany: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    tenant: {
      findUnique: mocks.mockFindUnique,
      findMany: mocks.mockFindMany,
      create: mocks.mockCreate,
      updateMany: mocks.mockUpdateMany,
    },
  },
  Prisma: {},
}));

const row = {
  id: "t1",
  name: "Anime Store",
  slug: "anime-store",
  domain: "animax.example.com",
  locale: "en",
  currency: "USD",
  countryCode: "US",
  status: "ACTIVE",
  config: { theme: "dark" },
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
};

describe("PrismaTenantRepository", () => {
  const repo = new PrismaTenantRepository();

  it("implements the TenantRepository contract", () => {
    for (const method of ["findById", "findBySlug", "findByDomain", "list", "create", "update"]) {
      expect(typeof (repo as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("maps a tenant row to the domain type", async () => {
    mocks.mockFindUnique.mockResolvedValue(row);

    const tenant = await repo.findById("t1");

    expect(tenant).toEqual({
      id: "t1",
      name: "Anime Store",
      slug: "anime-store",
      domain: "animax.example.com",
      locale: "en",
      currency: "USD",
      countryCode: "US",
      status: "ACTIVE",
      config: { theme: "dark" },
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
    expect(mocks.mockFindUnique).toHaveBeenCalledWith({ where: { id: "t1" } });
  });

  it("returns null when no tenant matches", async () => {
    mocks.mockFindUnique.mockResolvedValue(null);

    await expect(repo.findById("missing")).resolves.toBeNull();
  });

  it("creates a tenant and serializes config as JSON", async () => {
    mocks.mockCreate.mockResolvedValue(row);

    await repo.create({ name: "Anime Store", slug: "anime-store", config: { theme: "dark" } });

    expect(mocks.mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Anime Store",
        slug: "anime-store",
        config: { theme: "dark" },
      }),
    });
  });

  it("writes JsonNull for a null config", async () => {
    mocks.mockCreate.mockResolvedValue(row);

    await repo.create({ name: "Anime Store", slug: "anime-store", config: null });

    expect(mocks.mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ config: Prisma.JsonNull }),
    });
  });

  it("throws NotFoundError when updating a missing tenant", async () => {
    mocks.mockUpdateMany.mockResolvedValue({ count: 0 });

    await expect(repo.update("t1", { name: "Renamed" })).rejects.toThrow(NotFoundError);
  });

  it("re-fetches and maps the tenant after a successful update", async () => {
    const updated = { ...row, name: "Renamed" };
    mocks.mockUpdateMany.mockResolvedValue({ count: 1 });
    mocks.mockFindUnique.mockResolvedValue(updated);

    const tenant = await repo.update("t1", { name: "Renamed" });

    expect(mocks.mockUpdateMany).toHaveBeenCalledWith({ where: { id: "t1" }, data: expect.objectContaining({ name: "Renamed" }) });
    expect(tenant.name).toBe("Renamed");
  });
});
