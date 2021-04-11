export interface MqttBrokerConfig {
    name: string;
    host: string;
    port: number;
    clientId?: string;
    path?: string;
    keepalive?: number;
    username?: string;
    password?: string;
}