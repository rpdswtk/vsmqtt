import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"vsmqtt-sidebar",
			sidebarProvider
		)
	);

	context.subscriptions.push(vscode.commands.registerCommand('vsmqtt.refreshMqttProfileList', () => {
		// brokerProfile = context.globalState.get("brokerProfiles");
		sidebarProvider._view?.webview.postMessage({
			type: 'refresh-list',
			value: null
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vsmqtt.refresh', async () => {
		//MqttConfigPanel.kill();
		//MqttConfigPanel.createOrShow(context.extensionUri);
		// await vscode.commands.executeCommand("workbench.action.closeSidebar");
		// await vscode.commands.executeCommand("workbench.view.extension.vsmqtt-sidebar-view");
		setTimeout(() => {
			vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
		}, 1000);
	}));


	const config = vscode.workspace.getConfiguration("settings");
	config.update("mqtt", "test", vscode.ConfigurationTarget.Global);
}

export function deactivate() { }
