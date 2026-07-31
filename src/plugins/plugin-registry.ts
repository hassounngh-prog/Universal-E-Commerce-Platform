import {
  PlatformPlugin,
  PluginStatus,
  type PluginInstance,
  type PluginManifest,
} from "../core/plugin/types";
import type { PluginContext } from "../core/plugin/plugin-context";
import { PluginCancelledError } from "../shared/errors/platform-error";

export interface PluginRegistryOptions {
  minPlatformVersion: string;
  maxPlatformVersion: string;
}

function satisfiesVersionRange(
  version: string,
  min: string,
  max: string,
): boolean {
  const parts = (v: string) => v.split(".").map((n) => parseInt(n, 10) || 0);
  const [a, b] = [parts(version), parts(min)];
  const [c, d] = [parts(version), parts(max)];
  const inRange = (cur: number[], lo: number[], hi: number[] = []) =>
    cur.every((n, i) => n >= (lo[i] ?? 0) && n <= (hi[i] ?? Infinity));
  return inRange(a, b) && inRange(c, d);
}

export class PluginRegistry {
  private readonly plugins = new Map<string, PluginInstance>();
  private readonly hooks = new Map<string, unknown>();

  constructor(private readonly options: PluginRegistryOptions) {}

  getPlugin(id: string): PluginInstance | undefined {
    return this.plugins.get(id);
  }

  listPlugins(): PluginInstance[] {
    return [...this.plugins.values()];
  }

  async register(
    manifest: PluginManifest,
    factory: (ctx: PluginContext) => Promise<PlatformPlugin>,
    context: PluginContext,
  ): Promise<PluginInstance> {
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin already registered: ${manifest.id}`);
    }
    if (!satisfiesVersionRange(manifest.version, this.options.minPlatformVersion, this.options.maxPlatformVersion)) {
      throw new Error(
        `Plugin ${manifest.id}@${manifest.version} is not compatible with platform ${this.options.minPlatformVersion}-${this.options.maxPlatformVersion}`,
      );
    }

    const instance: PluginInstance = {
      manifest,
      status: PluginStatus.Registered,
      instance: null,
      deps: { resolved: [], missing: [], optional: [] },
    };
    this.plugins.set(manifest.id, instance);

    for (const depId of Object.keys(manifest.dependencies ?? {})) {
      if (this.plugins.has(depId)) {
        instance.deps.resolved.push(depId);
      } else {
        instance.deps.missing.push(depId);
      }
    }
    for (const optId of Object.keys(manifest.optionalDependencies ?? {})) {
      instance.deps.optional.push({ id: optId, present: this.plugins.has(optId) });
    }

    if (instance.deps.missing.length > 0) {
      instance.status = PluginStatus.Failed;
      throw new Error(
        `Plugin ${manifest.id} is missing required dependencies: ${instance.deps.missing.join(", ")}`,
      );
    }

    instance.status = PluginStatus.Resolved;
    instance.instance = await factory(context);
    instance.status = PluginStatus.Initialized;

    await this.activate(instance, context);
    return instance;
  }

  async activate(instance: PluginInstance, context: PluginContext): Promise<void> {
    if (instance.status === PluginStatus.Active) {
      return;
    }
    try {
      await instance.instance?.onActivate(context);
      instance.status = PluginStatus.Active;
    } catch (error) {
      instance.status = PluginStatus.Failed;
      throw error;
    }
  }

  async deactivate(instance: PluginInstance, context: PluginContext): Promise<void> {
    if (instance.status === PluginStatus.Deactivated) {
      return;
    }
    try {
      await instance.instance?.onDeactivate?.(context);
      instance.status = PluginStatus.Deactivated;
    } catch (error) {
      instance.status = PluginStatus.Failed;
      throw error;
    }
  }

  async unregister(id: string, context: PluginContext): Promise<void> {
    const instance = this.plugins.get(id);
    if (!instance) {
      return;
    }
    if (instance.status === PluginStatus.Active) {
      await this.deactivate(instance, context);
    }
    for (const plugin of this.plugins.values()) {
      if (plugin.deps.resolved.includes(id)) {
        throw new PluginCancelledError(
          `Cannot unregister ${id}: plugin ${plugin.manifest.id} depends on it`,
        );
      }
    }
    this.plugins.delete(id);
  }

  registerHook(hookPoint: string, handler: unknown, priority = 0): void {
    const key = `${priority}:${hookPoint}`;
    this.hooks.set(key, handler);
  }

  getHooks(hookPoint: string): unknown[] {
    return [...this.hooks.entries()]
      .filter(([key]) => key.endsWith(`:${hookPoint}`))
      .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
      .map(([, handler]) => handler);
  }
}
