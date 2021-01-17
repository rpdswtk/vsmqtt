import * as vscode from 'vscode';
import { MqttConfigPanel } from './MqttConfigPanel';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri, context.globalState);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"vsmqtt-sidebar",
			sidebarProvider
		)
	);

	context.subscriptions.push(vscode.commands.registerCommand('vsmqtt.helloWorld', () => {
		//HelloWorldPanel.createOrShow(context.extensionUri);
		//MqttConfigPanel.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vsmqtt.addTodo', () => {
		sidebarProvider._view?.webview.postMessage({
			type: 'new-todo',
			value: 'hsdalkshdkashkdahs'
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vsmqtt.refresh', async () => {
		MqttConfigPanel.kill();
		MqttConfigPanel.createOrShow(context.extensionUri, context.globalState);
		// await vscode.commands.executeCommand("workbench.action.closeSidebar");
		// await vscode.commands.executeCommand("workbench.view.extension.vsmqtt-sidebar-view");
		setTimeout(() => {
			vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
		}, 1000);
	}));

	// MqttConfigPanel.createOrShow(context.extensionUri);

	// MqttConfigPanel.currentPanel?._panel.webview?.onDidReceiveMessage(async (data) => {
	// 	switch (data.type) {
	// 		case "add-mqtt-profile": {
	// 			await context.globalState.update(data.value.name, data.value);
	// 			MqttConfigPanel.kill();
	// 		}
	// 	}
	// });
}

export function deactivate() { }
