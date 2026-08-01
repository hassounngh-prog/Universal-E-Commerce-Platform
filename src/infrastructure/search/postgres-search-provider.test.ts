import { describe, expect, it, vi } from "vitest";
import { PostgresSearchProvider } from "./postgres-search-provider";
import type { SearchDocument } from "@/core/search/search-provider.interface";

const mocks = vi.hoisted(() => ({
  mockUpsert: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockDeleteMany: vi.fn(),
  mockQueryRaw: vi.fn(),
  mockExecuteRaw: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    searchDocument: {
      upsert: mocks.mockUpsert,
      findMany: mocks.mockFindMany,
      count: mocks.mockCount,
      deleteMany: mocks.mockDeleteMany,
    },
    $queryRaw: mocks.mockQueryRaw,
    $executeRaw: mocks.mockExecuteRaw,
    $transaction: mocks.mockTransaction,
  },
  Prisma: {
    sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
    InputJsonValue: {},
  },
}));

const settings = { defaultIndex: "products" };
const document: SearchDocument = {
  id: "p1",
  index: "products",
  fields: { name: "Anime Figurine", price: 2999 },
};

describe("PostgresSearchProvider", () => {
  it("implements the SearchProvider contract", () => {
    const provider = new PostgresSearchProvider(settings);
    expect(provider.id).toBe("postgres");
    expect(provider.name).toContain("Postgres");
    for (const method of ["indexDocument", "bulkIndexDocuments", "deleteDocument", "search", "createIndex", "deleteIndex"]) {
      expect(typeof (provider as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("upserts a document when indexing", async () => {
    mocks.mockUpsert.mockResolvedValue({ id: "p1" });
    const provider = new PostgresSearchProvider(settings);

    await provider.indexDocument(document);

    expect(mocks.mockUpsert).toHaveBeenCalledWith({
      where: { id: "p1" },
      create: expect.objectContaining({ id: "p1", index: "products", fields: document.fields }),
      update: expect.objectContaining({ index: "products" }),
    });
  });

  it("bulk-indexes documents inside a transaction", async () => {
    mocks.mockTransaction.mockImplementation((queries: unknown[]) => Promise.resolve(queries));
    const provider = new PostgresSearchProvider(settings);

    await provider.bulkIndexDocuments([document]);

    expect(mocks.mockTransaction).toHaveBeenCalledTimes(1);
  });

  it("deletes a document by index and id", async () => {
    mocks.mockDeleteMany.mockResolvedValue({ count: 1 });
    const provider = new PostgresSearchProvider(settings);

    await provider.deleteDocument("products", "p1");

    expect(mocks.mockDeleteMany).toHaveBeenCalledWith({ where: { id: "p1", index: "products" } });
  });

  it("searches with full-text matching and returns hits", async () => {
    mocks.mockQueryRaw
      .mockResolvedValueOnce([{ id: "p1", index: "products", fields: { name: "Figurine" } }])
      .mockResolvedValueOnce([{ total: BigInt(1) }]);
    const provider = new PostgresSearchProvider(settings);

    const result = await provider.search({ index: "products", text: "figurine", size: 10 });

    expect(result.hits).toHaveLength(1);
    expect(result.hits[0]?.id).toBe("p1");
    expect(result.total).toBe(1);
    expect(result.tookMs).toBeGreaterThanOrEqual(0);
    expect(mocks.mockQueryRaw).toHaveBeenCalledTimes(2);
  });

  it("falls back to listing when no query text is provided", async () => {
    mocks.mockFindMany.mockResolvedValue([{ id: "p1", index: "products", fields: { name: "Figurine" }, updatedAt: new Date() }]);
    mocks.mockCount.mockResolvedValue(1);
    const provider = new PostgresSearchProvider(settings);

    const result = await provider.search({ index: "products" });

    expect(result.hits).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mocks.mockFindMany).toHaveBeenCalled();
    expect(mocks.mockQueryRaw).not.toHaveBeenCalled();
  });

  it("does not run runtime schema mutations when creating an index", async () => {
    const provider = new PostgresSearchProvider(settings);

    await provider.createIndex("products");

    expect(mocks.mockExecuteRaw).not.toHaveBeenCalled();
  });

  it("clears documents of an index when deleting it", async () => {
    mocks.mockDeleteMany.mockResolvedValue({ count: 3 });
    const provider = new PostgresSearchProvider(settings);

    await provider.deleteIndex("products");

    expect(mocks.mockDeleteMany).toHaveBeenCalledWith({ where: { index: "products" } });
  });
});
