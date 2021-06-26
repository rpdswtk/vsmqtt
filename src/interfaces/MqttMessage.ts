export interface MQTTMessage {
    id: number;
    topic: string;
    payload: string;
    retain: boolean;
    qos: number;
    timestamp: string;
}