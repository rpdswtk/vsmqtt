import { AsyncClient, connect } from 'async-mqtt';
import { MqttBrokerConfig } from './models/MqttBrokerConfig';
import * as fs from 'fs';
import * as vscode from 'vscode';

export class MqttClientFactory {

    private static clients: Map<string, AsyncClient> = new Map<string, AsyncClient>();

    public static createClient(config: MqttBrokerConfig): AsyncClient {
        var client = MqttClientFactory.clients.get(config.name);
        if (client) {
            return client;
        }

        let options = Object.assign({}, config);

        if (options.ca) {
            try {
                options.ca = fs.readFileSync(options.ca);
            } catch (error) {
                options.ca = undefined;
                console.error(error);
                vscode.window.showErrorMessage("Could not open cert file");
            }
        }

        client = connect(options);
        MqttClientFactory.clients.set(options.name, client);
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