import * as vscode from 'vscode';
import {MqttBrokerConfig} from './models/MqttBrokerConfig';

export async function saveBrokerProfile(newProfile: MqttBrokerConfig) {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles");
    brokerProfiles?.push(newProfile);
    await config.update("brokerProfiles", brokerProfiles);
}

export async function loadBrokerProfiles(): Promise<MqttBrokerConfig[] | undefined> {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles");
    return brokerProfiles;
}
