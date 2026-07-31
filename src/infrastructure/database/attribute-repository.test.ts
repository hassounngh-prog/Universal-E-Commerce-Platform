import { describe, expect, it, vi } from "vitest";
import { PrismaAttributeRepository } from "./attribute-repository";

const mocks = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    attribute: {
      findFirst: mocks.mockFindFirst,
    },
  },
  Prisma: {},
}));

const row = {
  id: "a1",
  tenantId: "t1",
  name: "Color",
  slug: "color",
  type: "SELECT",
  unit: null,
  required: false,
  filterable: true,
  sortable: false,
  group: "appearance",
  options: [{ value: "red", label: "Red" }, { value: "blue", label: "Blue" }],
  isGlobal: false,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
};

describe("PrismaAttributeRepository", () => {
  const repo = new PrismaAttributeRepository();

  it("implements the AttributeRepository contract", () => {
    for (const method of ["findById", "findBySlug"]) {
      expect(typeof (repo as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("maps an attribute row to the domain type", async () => {
    mocks.mockFindFirst.mockResolvedValue(row);

    const attribute = await repo.findById("t1", "a1");

    expect(attribute).toEqual({
      id: "a1",
      tenantId: "t1",
      name: "Color",
      slug: "color",
      type: "SELECT",
      unit: null,
      required: false,
      filterable: true,
      sortable: false,
      group: "appearance",
      options: [{ value: "red", label: "Red" }, { value: "blue", label: "Blue" }],
      isGlobal: false,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
    expect(mocks.mockFindFirst).toHaveBeenCalledWith({
      where: { id: "a1", tenantId: "t1" },
    });
  });

  it("scopes lookups to the default tenant when tenantId is null", async () => {
    mocks.mockFindFirst.mockResolvedValue(null);

    await repo.findBySlug(null, "color");

    expect(mocks.mockFindFirst).toHaveBeenCalledWith({
      where: { slug: "color" },
    });
  });

  it("returns null when the attribute is not found", async () => {
    mocks.mockFindFirst.mockResolvedValue(null);

    const attribute = await repo.findById("t1", "missing");

    expect(attribute).toBeNull();
  });
});
