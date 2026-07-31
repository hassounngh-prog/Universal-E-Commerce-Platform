import { describe, expect, it, vi, afterEach } from "vitest";
import { ConsoleNotificationChannel } from "./console-notification-channel";
import type { NotificationMessage } from "@/core/notification/notification-channel.interface";

describe("ConsoleNotificationChannel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("implements the NotificationChannel contract", () => {
    const channel = new ConsoleNotificationChannel();
    expect(channel.id).toBe("console");
    expect(channel.type).toBe("email");
    expect(typeof channel.send).toBe("function");
  });

  it("sends an email message and returns a successful result", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const channel = new ConsoleNotificationChannel();

    const message: NotificationMessage = {
      channel: "email",
      recipient: { email: "buyer@example.com" },
      subject: "Order shipped",
      body: "Your order is on the way",
    };

    const result = await channel.send(message);

    expect(result.success).toBe(true);
    expect(result.channel).toBe("email");
    expect(result.messageId).toMatch(/^console-/);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("sends an SMS message using the phone recipient", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const channel = new ConsoleNotificationChannel();

    const message: NotificationMessage = {
      channel: "sms",
      recipient: { phone: "+15550000000" },
      body: "Your code is 1234",
    };

    const result = await channel.send(message);

    expect(result.success).toBe(true);
    expect(result.channel).toBe("sms");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
