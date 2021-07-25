import { AsyncClient, connect } from 'async-mqtt';
import { MqttBrokerConfig } from './interfaces/MqttBrokerConfig';
import * as fs from 'fs';
import * as vscode from 'vscode';
const { isAbsolutePath } = require('path-validation');

export class MqttClientFactory {

    private static clients: Map<string, AsyncClient> = new Map<string, AsyncClient>();

    public static createClient(config: MqttBrokerConfig, viewType: string): AsyncClient {
        var client = MqttClientFactory.clients.get(MqttClientFactory.getId(config.name, viewType));
        if (client) {
            return client;
        }

        let options = Object.assign({}, config);

        if (options.ca) {
            if (isAbsolutePath(options.ca, "\\") || isAbsolutePath(options.ca, "/")) {
                try {
                    options.ca = fs.readFileSync(options.ca);
                } catch (error) {
                    options.ca = undefined;
                    console.error(error);
                    vscode.window.showErrorMessage("Could not open cert file");
                }
            }
        }

        client = connect(options);
        MqttClientFactory.clients.set(MqttClientFactory.getId(config.name, viewType), client);
        return client;
    }

    public static disposeClient(config: MqttBrokerConfig, viewType: string) {
        const client = MqttClientFactory.clients.get(MqttClientFactory.getId(config.name, viewType));
        client?.removeAllListeners();
        client?.end();
        if (client) {
            MqttClientFactory.clients.delete(MqttClientFactory.getId(config.name, viewType));
        }
    }

    private static getId(brokerProfileName: string, viewType: string): string {
        return `${brokerProfileName}-${viewType}`;
    }
}