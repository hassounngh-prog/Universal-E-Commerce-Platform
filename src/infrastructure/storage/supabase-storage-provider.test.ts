import { describe, expect, it, vi } from "vitest";
import { SupabaseStorageProvider } from "./supabase-storage-provider";

const mockUpload = vi.fn();
const mockDownload = vi.fn();
const mockRemove = vi.fn();
const mockList = vi.fn();
const mockCreateSignedUrl = vi.fn();
const mockCreateSignedUploadUrl = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        download: mockDownload,
        remove: mockRemove,
        list: mockList,
        createSignedUrl: mockCreateSignedUrl,
        createSignedUploadUrl: mockCreateSignedUploadUrl,
      })),
    },
  })),
}));

const settings = {
  url: "https://example.supabase.co",
  anonKey: "anon-key",
  bucket: "products",
};

describe("SupabaseStorageProvider", () => {
  it("implements the StorageProvider contract", () => {
    const provider = new SupabaseStorageProvider(settings);
    expect(provider.id).toBe("supabase");
    expect(provider.name).toBe("Supabase Storage");
    for (const method of ["upload", "download", "delete", "getSignedUrl", "exists"]) {
      expect(typeof (provider as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("rejects construction without URL and anon key", () => {
    expect(() => new SupabaseStorageProvider({ bucket: "products" })).toThrow("URL and anon key");
  });

  it("uploads a buffer and returns a StorageObject", async () => {
    mockUpload.mockResolvedValue({ error: null, data: { path: "images/a.png" } });
    const provider = new SupabaseStorageProvider(settings);

    const result = await provider.upload(
      "images/a.png",
      new Uint8Array([1, 2, 3]),
      { contentType: "image/png", metadata: { title: "hero" } },
    );

    expect(result.key).toBe("images/a.png");
    expect(result.size).toBe(3);
    expect(result.contentType).toBe("image/png");
    expect(mockUpload).toHaveBeenCalledWith(
      "images/a.png",
      new Uint8Array([1, 2, 3]),
      expect.objectContaining({ contentType: "image/png", upsert: true }),
    );
  });

  it("throws when upload fails", async () => {
    mockUpload.mockResolvedValue({ error: { message: "bucket not found" }, data: null });
    const provider = new SupabaseStorageProvider(settings);

    await expect(
      provider.upload("images/a.png", new Uint8Array([1]), { contentType: "image/png" }),
    ).rejects.toThrow("bucket not found");
  });

  it("downloads bytes with content type", async () => {
    mockDownload.mockResolvedValue({
      error: null,
      data: new Blob(["hello"], { type: "text/plain" }),
    });
    const provider = new SupabaseStorageProvider(settings);

    const result = await provider.download("files/a.txt");

    expect(new TextDecoder().decode(result.data)).toBe("hello");
    expect(result.contentType).toBe("text/plain");
  });

  it("deletes an object", async () => {
    mockRemove.mockResolvedValue({ error: null });
    const provider = new SupabaseStorageProvider(settings);

    await expect(provider.delete("images/a.png")).resolves.toBeUndefined();
    expect(mockRemove).toHaveBeenCalledWith(["images/a.png"]);
  });

  it("creates a read signed URL by default", async () => {
    mockCreateSignedUrl.mockResolvedValue({ error: null, data: { signedUrl: "https://signed/read" } });
    const provider = new SupabaseStorageProvider(settings);

    const url = await provider.getSignedUrl("images/a.png");

    expect(url).toBe("https://signed/read");
    expect(mockCreateSignedUrl).toHaveBeenCalledWith("images/a.png", 3600);
  });

  it("creates a write signed URL when requested", async () => {
    mockCreateSignedUploadUrl.mockResolvedValue({ error: null, data: { signedUrl: "https://signed/write" } });
    const provider = new SupabaseStorageProvider(settings);

    const url = await provider.getSignedUrl("images/a.png", 60, "write");

    expect(url).toBe("https://signed/write");
    expect(mockCreateSignedUploadUrl).toHaveBeenCalledWith("images/a.png", { upsert: true });
  });

  it("reports existence via list", async () => {
    mockList.mockResolvedValue({ error: null, data: [{ name: "a.png" }] });
    const provider = new SupabaseStorageProvider(settings);

    await expect(provider.exists("images/a.png")).resolves.toBe(true);
    await expect(provider.exists("images/missing.png")).resolves.toBe(true);
  });

  it("returns false when list fails", async () => {
    mockList.mockResolvedValue({ error: { message: "nope" }, data: null });
    const provider = new SupabaseStorageProvider(settings);

    await expect(provider.exists("images/a.png")).resolves.toBe(false);
  });
});
