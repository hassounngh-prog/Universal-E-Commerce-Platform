import type { PluginManifest } from "../core/plugin/types";

export interface DiscoveredPlugin {
  id: string;
  path: string;
  manifest: PluginManifest;
}

const REQUIRED_FIELDS = [
  "id",
  "version",
  "name",
  "description",
  "minPlatformVersion",
  "maxPlatformVersion",
  "permissions",
] as const;

export class ManifestRegistry {
  private readonly discovered = new Map<string, DiscoveredPlugin>();

  async loadManifest(pluginPath: string, manifestPath?: string): Promise<DiscoveredPlugin> {
    const fs = await import("node:fs/promises");
    const path = manifestPath ?? pluginPath.replace(/\/$/, "") + "/plugin.json";
    const raw = await fs.readFile(path, "utf8");
    return this.registerFromJson(pluginPath, raw);
  }

  registerFromJson(pluginPath: string, json: string): DiscoveredPlugin {
    const manifest = JSON.parse(json) as Partial<PluginManifest>;
    for (const field of REQUIRED_FIELDS) {
      if (manifest[field] === undefined) {
        throw new Error(`Invalid plugin manifest at ${pluginPath}: missing field "${field}"`);
      }
    }
    const discovered = { id: manifest.id as string, path: pluginPath, manifest: manifest as PluginManifest };
    this.discovered.set(discovered.id, discovered);
    return discovered;
  }

  getDiscovered(id: string): DiscoveredPlugin | undefined {
    return this.discovered.get(id);
  }

  listDiscovered(): DiscoveredPlugin[] {
    return [...this.discovered.values()];
  }
}
