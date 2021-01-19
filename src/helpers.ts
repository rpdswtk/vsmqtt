import * as vscode from 'vscode';

export async function saveBrokerProfile(newProfile: object) {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<{}>>("brokerProfiles");
    brokerProfiles?.push(newProfile);
    await config.update("brokerProfiles", brokerProfiles);
}

export async function loadBrokerProfiles() {
    let config = await vscode.workspace.getConfiguration("vsmqtt");
    let brokerProfiles = await config.get<Array<{}>>("brokerProfiles");
    return brokerProfiles;
}