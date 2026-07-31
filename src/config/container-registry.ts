type Factory<T> = () => T;

export class Container {
  private factories = new Map<string, Factory<unknown>>();
  private instances = new Map<string, unknown>();
  private readonly singletonDefaults = true;

  register<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
  }

  resolve<T>(key: string): T {
    if (this.singletonDefaults && this.instances.has(key)) {
      return this.instances.get(key) as T;
    }

    const factory = this.factories.get(key);
    if (!factory) {
      throw new ContainerError(`No provider registered for: ${key}`);
    }

    const instance = factory() as T;

    if (this.singletonDefaults) {
      this.instances.set(key, instance);
    }

    return instance;
  }

  reset(): void {
    this.instances.clear();
  }

  list(): string[] {
    return [...this.factories.keys()];
  }
}

export class ContainerError extends Error {
  constructor(message: string) {
    super(`[Container] ${message}`);
    this.name = "ContainerError";
  }
}
