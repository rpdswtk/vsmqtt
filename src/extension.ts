import * as vscode from 'vscode';
import { MqttConnectionView } from './MqttConnectionView';
import { VSMqttApp } from './VSMqttApp';


export function activate(context: vscode.ExtensionContext) {
	new VSMqttApp(context);

	vscode.commands.registerCommand("vsmqtt.devRefresh", () => {
		MqttConnectionView.kill();
		setTimeout(() => {
			MqttConnectionView.createOrShow(context.extensionUri, {
				address: "localhost",
				port: 1883,
				name: "dev test"
			});
		}, 1000);
	});
}

export function deactivate() { }
