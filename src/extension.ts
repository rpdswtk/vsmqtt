import * as vscode from 'vscode';
import { CommandProvider } from './CommandProvider';
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
		vscode.commands.registerCommand('vsmqtt.connectToBroker', (brokerProfile) => {
			vscode.window.showInformationMessage("connect to " + brokerProfile.address);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("vsmqtt.addProfile", async () => {
			await commandProvider.addProfile();
			profilesProvider.update();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('vsmqtt.refreshProfileList', async () => {
			profilesProvider.update();
		})
	);

	console.log("asdasdasdasd");
}

export function deactivate() { }
