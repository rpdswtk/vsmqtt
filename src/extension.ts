import * as vscode from "vscode"
import { VSMqttApp } from "./VSMqttApp"
import { detectProfileScopeConflict } from "./config"

export function activate(context: vscode.ExtensionContext): void {
  new VSMqttApp(context)

  // Check for profile scope conflicts on startup
  detectProfileScopeConflict()

  // Re-check when the setting changes at runtime
  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('vsmqtt.profileStorageTarget')) {
      detectProfileScopeConflict()
    }
  }, null, context.subscriptions)
}

export function deactivate(): void {
  // do nothing
}
