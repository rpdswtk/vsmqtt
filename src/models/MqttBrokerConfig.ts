export interface MqttBrokerConfig {
    //id?: number;
    name: string;
    address: string;
    port: number;
    clientID?: string;
}