import { describe, expect, it } from "vitest";
import { Container, ContainerError } from "./container-registry";

describe("Container", () => {
  it("registers and resolves factories", () => {
    const container = new Container();
    container.register("greeting", () => "hello");

    expect(container.resolve<string>("greeting")).toBe("hello");
  });

  it("returns singleton instances by default", () => {
    const container = new Container();
    let count = 0;
    container.register("counter", () => {
      count += 1;
      return count;
    });

    expect(container.resolve<number>("counter")).toBe(1);
    expect(container.resolve<number>("counter")).toBe(1);
  });

  it("clears cached instances on reset", () => {
    const container = new Container();
    let count = 0;
    container.register("counter", () => {
      count += 1;
      return count;
    });

    container.resolve<number>("counter");
    container.reset();
    expect(container.resolve<number>("counter")).toBe(2);
  });

  it("lists registered keys", () => {
    const container = new Container();
    container.register("a", () => 1);
    container.register("b", () => 2);

    expect(container.list().sort()).toEqual(["a", "b"]);
  });

  it("throws a ContainerError for unknown keys", () => {
    const container = new Container();

    expect(() => container.resolve("missing")).toThrow(ContainerError);
    expect(() => container.resolve("missing")).toThrow("No provider registered");
  });
});
