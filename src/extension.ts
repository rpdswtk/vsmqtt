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

	context.subscriptions.push(vscode.commands.registerCommand('vsmqtt.helloWorld', () => {
		//HelloWorldPanel.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vsmqtt.addTodo', () => {
		sidebarProvider._view?.webview.postMessage({
			type: 'new-todo',
			value: 'hsdalkshdkashkdahs'
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vsmqtt.refresh', async () => {
		// HelloWorldPanel.kill();
		// HelloWorldPanel.createOrShow(context.extensionUri);
		await vscode.commands.executeCommand("workbench.action.closeSidebar");
		await vscode.commands.executeCommand("workbench.view.extension.vsmqtt-sidebar-view");
		setTimeout(() => {
			vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
		}, 1000);
	}));


}

export function deactivate() { }
