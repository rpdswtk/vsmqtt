import * as vscode from 'vscode';
import { MqttBrokerConfig } from './models/MqttBrokerConfig';

export async function saveBrokerProfile(newProfile: MqttBrokerConfig) {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles");
    if (brokerProfiles) {
        let index = brokerProfiles?.findIndex((profile) => profile.id === newProfile.id);
        if (index !== undefined && index !== -1) {
            brokerProfiles[index] = newProfile;
        } else {
            brokerProfiles.push(newProfile);
        }
        await config.update("brokerProfiles", brokerProfiles);
    }
}

export async function removeBrokerProfile(brokerProfile: MqttBrokerConfig) {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles");
    if (brokerProfiles) {
        let index = brokerProfiles?.findIndex((profile) => profile.id === brokerProfile.id);
        if (index !== undefined && index !== -1) {
            brokerProfiles.splice(index, 1);
        }
    }
}

export async function loadBrokerProfiles(): Promise<MqttBrokerConfig[] | undefined> {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles");
    return brokerProfiles;
}
