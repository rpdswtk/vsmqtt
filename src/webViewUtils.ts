import * as vscode from "vscode"
import { Uri, Webview } from "vscode"

export function getNonce(): string {
  let text = ""
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]): vscode.Uri {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList))
}
