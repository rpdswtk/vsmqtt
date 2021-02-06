export interface SubscriptionItem {
    topic: string,
    qos: number
}

export interface MQTTMessage {
    topic: string,
    payload: string,
    retain: boolean,
    qos: number,
    timestamp: string
}