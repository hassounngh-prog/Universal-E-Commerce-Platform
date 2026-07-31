import type { HookRegistry } from "./hook-registry.interface";
import type { EventBus } from "./event-bus.interface";
import type {
  AdminExtensionAPI,
  StorefrontExtensionAPI,
  PluginLogger,
} from "./types";

export interface PluginConfig {
  [key: string]: unknown;
}

export interface PluginContext {
  config: PluginConfig;
  tenantId: string | null;
  hooks: HookRegistry;
  events: EventBus;
  admin: AdminExtensionAPI;
  storefront: StorefrontExtensionAPI;
  logger: PluginLogger;
}
