export interface PlatformErrorOptions {
  code?: string;
  details?: unknown;
  cause?: unknown;
}

export class PlatformError extends Error {
  readonly code: string;
  readonly details: unknown;

  constructor(message: string, options: PlatformErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "PlatformError";
    this.code = options.code ?? "platform_error";
    this.details = options.details;
  }
}

export class NotFoundError extends PlatformError {
  constructor(message: string, options: Omit<PlatformErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "not_found" });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends PlatformError {
  constructor(message: string, options: Omit<PlatformErrorOptions, "code"> = {}) {
    super(message, { ...options, code: "validation_error" });
    this.name = "ValidationError";
  }
}

export class PluginCancelledError extends PlatformError {
  constructor(message = "Operation cancelled by a plugin") {
    super(message, { code: "plugin_cancelled" });
    this.name = "PluginCancelledError";
  }
}
