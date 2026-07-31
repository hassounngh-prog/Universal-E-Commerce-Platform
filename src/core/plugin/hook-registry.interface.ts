export type HookHandler = (input: unknown, context: HookContext) => Promise<unknown>;

export interface BeforeResult {
  modified?: unknown;
  cancelled?: boolean;
  reason?: string;
}

export interface HookContext {
  hookPoint: string;
  tenantId: string | null;
}

export interface HookRegistry {
  register(hookPoint: string, handler: HookHandler, priority?: number): void;
  unregister(hookPoint: string, handler: HookHandler): void;
  executeBefore(hookPoint: string, input: unknown): Promise<BeforeResult>;
  executeAfter(hookPoint: string, input: unknown, result: unknown): Promise<unknown>;
  executeAround(hookPoint: string, input: unknown, next: () => unknown): Promise<unknown>;
}
