import * as vscode from "vscode"
import { VSMqttApp } from "./VSMqttApp"

export function activate(context: vscode.ExtensionContext): void {
  new VSMqttApp(context)
}

export function deactivate(): void {
  // do nothing
}
