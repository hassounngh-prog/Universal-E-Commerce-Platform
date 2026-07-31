import { describe, expect, it, vi, beforeEach } from "vitest";

const mockUpsert = vi.fn();
const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockDeleteMany = vi.fn();
const mockQueryRaw = vi.fn();
const mockExecuteRaw = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    searchDocument: {
      upsert: mockUpsert,
      findMany: mockFindMany,
      count: mockCount,
      deleteMany: mockDeleteMany,
    },
    taxCategory: { findFirst: vi.fn() },
    taxRate: { findFirst: vi.fn() },
    $queryRaw: mockQueryRaw,
    $executeRaw: mockExecuteRaw,
    $transaction: mockTransaction,
  },
  Prisma: {
    sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
    InputJsonValue: {},
  },
}));

describe("container composition root", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("SUPABASE_STORAGE_BUCKET", "products");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
  });

  it("resolves a provider for every registered key", async () => {
    const { container, KEYS } = await import("./container");

    const ids = {
      payment: (container.resolve(KEYS.payment) as { id: string }).id,
      storage: (container.resolve(KEYS.storage) as { id: string }).id,
      search: (container.resolve(KEYS.search) as { id: string }).id,
      tax: (container.resolve(KEYS.tax) as { id: string }).id,
      shipping: (container.resolve(KEYS.shipping) as { id: string }).id,
      notification: (container.resolve(KEYS.notification) as { id: string }).id,
    };

    expect(ids).toEqual({
      payment: "stripe",
      storage: "supabase",
      search: "postgres",
      tax: "postgres",
      shipping: "manual",
      notification: "console",
    });
  });

  it("returns singleton instances per key", async () => {
    const { container, KEYS } = await import("./container");

    const first = container.resolve(KEYS.shipping);
    const second = container.resolve(KEYS.shipping);

    expect(first).toBe(second);
  });

  it("fails fast on unknown keys", async () => {
    const { container } = await import("./container");

    expect(() => container.resolve("unknown.key")).toThrow("[Container] No provider registered");
  });
});
