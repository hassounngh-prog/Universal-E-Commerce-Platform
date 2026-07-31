import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  StorageObject,
  StorageProvider,
  StorageUploadOptions,
} from "../../core/storage/storage-provider.interface";
import type { StorageProviderSettings } from "../../shared/types/provider-settings";

export class SupabaseStorageProvider implements StorageProvider {
  readonly id = "supabase";
  readonly name = "Supabase Storage";

  private client: SupabaseClient | null = null;
  private readonly settings: StorageProviderSettings;

  constructor(settings: StorageProviderSettings) {
    if (!settings.url || !settings.anonKey) {
      throw new Error("[Storage] SUPABASE_URL and anon key are required");
    }
    this.settings = settings;
  }

  private get bucket() {
    return this.settings.bucket;
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      this.client = createClient(this.settings.url as string, this.settings.anonKey as string);
    }
    return this.client;
  }

  async upload(
    key: string,
    data: Buffer | Uint8Array | ReadableStream,
    options: StorageUploadOptions,
  ): Promise<StorageObject> {
    const body = data instanceof ReadableStream ? data : new Uint8Array(data as Buffer | Uint8Array);

    const { error, data: uploaded } = await this.getClient()
      .storage.from(this.bucket)
      .upload(key, body, {
        contentType: options.contentType,
        cacheControl: options.cacheControl ?? "3600",
        upsert: true,
        metadata: options.metadata,
      });

    if (error) {
      throw new Error(`[Storage] Upload failed for "${key}": ${error.message}`);
    }

    return {
      key,
      size: body instanceof Uint8Array ? body.byteLength : 0,
      contentType: options.contentType,
      etag: uploaded?.path,
      lastModified: new Date(),
    };
  }

  async download(key: string): Promise<{ data: Uint8Array; contentType: string }> {
    const { data, error } = await this.getClient().storage.from(this.bucket).download(key);

    if (error) {
      throw new Error(`[Storage] Download failed for "${key}": ${error.message}`);
    }

    return {
      data: new Uint8Array(await data.arrayBuffer()),
      contentType: data.type,
    };
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.getClient().storage.from(this.bucket).remove([key]);

    if (error) {
      throw new Error(`[Storage] Delete failed for "${key}": ${error.message}`);
    }
  }

  async getSignedUrl(
    key: string,
    expiresInSeconds = 3600,
    action: "read" | "write" = "read",
  ): Promise<string> {
    const storage = this.getClient().storage.from(this.bucket);

    if (action === "write") {
      const { data, error } = await storage.createSignedUploadUrl(key, { upsert: true });
      if (error) {
        throw new Error(`[Storage] Signed URL failed for "${key}": ${error.message}`);
      }
      const url = data?.signedUrl;
      if (!url) {
        throw new Error(`[Storage] Signed URL not returned for "${key}"`);
      }
      return url;
    }

    const { data, error } = await storage.createSignedUrl(key, expiresInSeconds);
    if (error) {
      throw new Error(`[Storage] Signed URL failed for "${key}": ${error.message}`);
    }
    const url = data?.signedUrl;
    if (!url) {
      throw new Error(`[Storage] Signed URL not returned for "${key}"`);
    }
    return url;
  }

  async exists(key: string): Promise<boolean> {
    const { data, error } = await this.getClient().storage.from(this.bucket).list(undefined, {
      search: key.split("/").pop() ?? key,
      limit: 1,
    });

    if (error) {
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  }
}
