import type { PluginContext } from "./plugin-context";

export interface PluginManifest {
  $schema?: string;
  id: string;
  version: string;
  name: string;
  description: string;
  author?: string;
  license?: string;
  icon?: string;
  minPlatformVersion: string;
  maxPlatformVersion: string;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  hooks?: string[];
  events?: {
    subscribes: string[];
    emits: string[];
  };
  permissions: string[];
  settings?: Record<string, unknown>;
  admin?: {
    menuItems: AdminMenuItem[];
    settingsPage: boolean;
  };
}

export enum PluginStatus {
  Discovered = "discovered",
  Registered = "registered",
  Resolved = "resolved",
  Initialized = "initialized",
  Active = "active",
  Deactivated = "deactivated",
  Failed = "failed",
}

export interface PluginInstance {
  manifest: PluginManifest;
  status: PluginStatus;
  instance: PlatformPlugin | null;
  deps: {
    resolved: string[];
    missing: string[];
    optional: { id: string; present: boolean }[];
  };
}

export abstract class PlatformPlugin {
  abstract onActivate(ctx: PluginContext): Promise<void>;
  onDeactivate?(ctx: PluginContext): Promise<void>;
  onConfigChange?(ctx: PluginContext): Promise<void>;
}

export interface AdminMenuItem {
  label: string;
  route: string;
  icon: string;
  permissions: string[];
}

export interface AdminExtensionAPI {
  addMenuItem(item: AdminMenuItem): void;
}

export interface StorefrontExtensionAPI {
  addNavItem(item: { label: string; route: string }): void;
  addRoute(route: { path: string; component: string }): void;
}

export interface PluginLogger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}
