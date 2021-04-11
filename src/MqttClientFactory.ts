import { AsyncClient, connect } from 'async-mqtt';
import { MqttBrokerConfig } from './models/MqttBrokerConfig';
import * as fs from 'fs';

export class MqttClientFactory {

    private static clients: Map<string, AsyncClient> = new Map<string, AsyncClient>();

    public static createClient(config: MqttBrokerConfig): AsyncClient {
        var client = MqttClientFactory.clients.get(config.name);
        if (client) {
            return client;
        }

        if (config.ca) {
            config.ca = fs.readFileSync(config.ca);
        }

        client = connect(config);
        MqttClientFactory.clients.set(config.name, client);
        return client;
    }

    public static disposeClient(config: MqttBrokerConfig) {
        const client = MqttClientFactory.clients.get(config.name);
        client?.removeAllListeners();
        client?.end();
        if (client) {
            MqttClientFactory.clients.delete(config.name);
        }
    }
}