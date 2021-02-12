import * as vscode from 'vscode';
import { VSMqttApp } from './VSMqttApp';


export function activate(context: vscode.ExtensionContext) {
	new VSMqttApp(context);
}

export function deactivate() { }
