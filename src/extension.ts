import * as vscode from 'vscode';
import { CommandProvider } from './CommandProvider';
import { loadBrokerProfiles } from './helpers';
import { MqttConnectionView } from './MqttConnectionView';
import { MqttProfilesProvider } from './MqttProfilesProvider';


export function activate(context: vscode.ExtensionContext) {
	const commandProvider = new CommandProvider();
	const profilesProvider = new MqttProfilesProvider();

	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			"mqttProfiles",
			profilesProvider
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vsmqtt.connectToBroker', async (brokerProfile?) => {
			if (brokerProfile) {
				brokerProfile = brokerProfile.brokerProfile;
			} else {
				let profiles = await loadBrokerProfiles();
				if (!profiles) { return; }
				let selectedProfileName = await vscode.window.showQuickPick(profiles?.map(profile => profile.name));
				if (!selectedProfileName) { return; }
				let selectedProfile = profiles.find((profile) => {
					return profile.name === selectedProfileName;
				});
				if (!selectedProfile) { return; }
				brokerProfile = selectedProfile;
			}
			MqttConnectionView.createOrShow(context.extensionUri, brokerProfile);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("vsmqtt.addProfile", async () => {
			await commandProvider.addProfile();
			profilesProvider.update();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("vsmqtt.deleteProfile", async (item) => {
			await commandProvider.deleteProfile(item.brokerProfile);
			profilesProvider.update();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vsmqtt.refreshProfileList', async () => {
			profilesProvider.update();
		})
	);
}

export function deactivate() { }
