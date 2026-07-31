export type NotificationChannelType =
  | "email"
  | "sms"
  | "push"
  | "webhook";

export interface NotificationRecipient {
  email?: string;
  phone?: string;
  pushToken?: string;
  webhookUrl?: string;
}

export interface NotificationMessage {
  channel: NotificationChannelType;
  recipient: NotificationRecipient;
  templateId?: string;
  subject?: string;
  body: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  messageId: string;
  channel: NotificationChannelType;
  error?: string;
}

export interface NotificationChannel {
  readonly id: string;
  readonly type: NotificationChannelType;

  send(message: NotificationMessage): Promise<NotificationResult>;
}
