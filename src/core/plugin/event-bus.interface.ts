export interface EventHandler {
  (payload: unknown, context: EventContext): Promise<void>;
}

export interface EventContext {
  eventId: string;
  eventType: string;
  timestamp: string;
  tenantId: string | null;
  source: string;
}

export interface EventBus {
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
  publish(eventType: string, payload: unknown): Promise<void>;
}
