import * as vscode from 'vscode';
import { MqttBrokerConfig } from './interfaces/MqttBrokerConfig';
import { MqttSubscription } from './interfaces/MqttSubscription';

export async function saveBrokerProfile(newProfile: MqttBrokerConfig) {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles");
    if (brokerProfiles) {
        let index = brokerProfiles?.findIndex((profile) => profile.name === newProfile.name);
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
        let index = brokerProfiles?.findIndex((profile) => profile.name === brokerProfile.name);
        if (index !== undefined && index !== -1) {
            brokerProfiles.splice(index, 1);
            await config.update("brokerProfiles", brokerProfiles);
        }
    }
}

export async function loadBrokerProfiles(): Promise<MqttBrokerConfig[] | undefined> {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles");
    return brokerProfiles;
}

export async function saveSubscription(brokerProfileName: string, subscription: MqttSubscription) {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles");
    let brokerProfile = brokerProfiles?.find(profile => profile.name === brokerProfileName);
    if (brokerProfile) {
        if (!brokerProfile.savedSubscriptions) {
            brokerProfile.savedSubscriptions = new Array();
        }
        let index = brokerProfile.savedSubscriptions.findIndex(s => s.topic === subscription.topic);
        if (index === -1) {
            brokerProfile.savedSubscriptions.push(subscription);
        } else {
            brokerProfile.savedSubscriptions[index] = subscription;
        }
        await config.update("brokerProfiles", brokerProfiles);
    }
}

export async function removeSavedSubscription(brokerProfileName: string, subscription: MqttSubscription) {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles");
    let brokerProfile = brokerProfiles?.find(profile => profile.name === brokerProfileName);
    if (brokerProfile && brokerProfile.savedSubscriptions) {
        let index = brokerProfile.savedSubscriptions.findIndex(s => s.topic === subscription.topic);
        if (index > -1) {
            brokerProfile.savedSubscriptions.splice(index,1);
            await config.update("brokerProfiles", brokerProfiles);
        }
    }
}

export function getNonce() {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
