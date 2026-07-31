import type {
  NotificationChannel,
  NotificationChannelType,
  NotificationMessage,
  NotificationResult,
} from "../../core/notification/notification-channel.interface";

export class ConsoleNotificationChannel implements NotificationChannel {
  readonly id = "console";
  readonly type: NotificationChannelType = "email";

  async send(message: NotificationMessage): Promise<NotificationResult> {
    const target =
      message.recipient.email ?? message.recipient.phone ?? message.recipient.webhookUrl ?? "unknown";

    console.info(
      `[Notification] ${message.channel} -> ${target}: ${message.subject ?? ""} ${message.body}`,
      { templateId: message.templateId, data: message.data },
    );

    return {
      success: true,
      messageId: `console-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      channel: message.channel,
    };
  }
}
