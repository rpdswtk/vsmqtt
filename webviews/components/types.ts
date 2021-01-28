export interface SubscriptionItem {
    topic: string,
    qos: number
}

export interface MQTTMessage {
    topic: string,
    payload: string
}
