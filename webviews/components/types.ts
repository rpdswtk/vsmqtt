export interface SubscriptionItem {
    topic: string,
    qos: number,
    color: string
}

export interface MQTTMessage {
    topic: string,
    payload: string,
    retain: boolean,
    qos: number,
    timestamp: string
}