export interface SubscriptionItem {
    topic: string;
    qos: number;
    color: string;
    messageCount: number;
    muted?: boolean;
}