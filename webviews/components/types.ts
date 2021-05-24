export interface SubscriptionItem {
    topic: string,
    qos: number,
    color: string,
    messageCount: number
}

export interface MQTTMessage {
    id: number,
    topic: string,
    payload: string,
    retain: boolean,
    qos: number,
    timestamp: string
}