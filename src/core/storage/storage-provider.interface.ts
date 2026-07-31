export interface StorageObject {
  key: string;
  size: number;
  contentType: string;
  etag?: string;
  lastModified?: Date;
}

export interface StorageUploadOptions {
  contentType: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  visibility?: "public" | "private";
}

export interface StorageProvider {
  readonly id: string;
  readonly name: string;

  upload(
    key: string,
    data: Buffer | Uint8Array | ReadableStream,
    options: StorageUploadOptions,
  ): Promise<StorageObject>;
  download(key: string): Promise<{ data: Uint8Array; contentType: string }>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number, action?: "read" | "write"): Promise<string>;
  exists(key: string): Promise<boolean>;
}
