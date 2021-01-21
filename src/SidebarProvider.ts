import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import { loadBrokerProfiles, removeBrokerProfile } from "./helpers";
import { MqttConfigPanel } from "./MqttConfigPanel";

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    public async resolveWebviewView(webviewView: vscode.WebviewView) {

        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = await this._getHtmlForWebview(webviewView.webview);

        webviewView.onDidChangeVisibility(async (e) => {
            let profiles = await loadBrokerProfiles();
            this._view?.webview.postMessage({
                type: "update-profile-list",
                value: profiles
            });
        });

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "onInfo": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showInformationMessage(data.value);
                    break;
                }
                case "onError": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
                case "edit-mqtt-profile": {
                    if (!data.value) {
                        return;
                    }
                    MqttConfigPanel.createOrShow(this._extensionUri, data.value);
                    break;
                }
                case "delete-mqtt-profile": {
                    if (!data.value) {
                        return;
                    }
                    removeBrokerProfile(data.value);
                    break;
                }
            }
        });

        vscode.workspace.onDidChangeConfiguration(async (_event) => {
            let profiles = await loadBrokerProfiles();
            console.log("ka djas dklasdh lkashdkadhkjahsd kashd kashdkashd lkajsd");
            this._view?.webview.postMessage({
                type: "update-profile-list",
                value: profiles
            });
        });
    }

    public revive(panel: vscode.WebviewView) {
        this._view = panel;
    }

    private async _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Sidebar.js")
        );
        const styleMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Sidebar.css")
        );

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        const brokerProfiles = await loadBrokerProfiles();

        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource
            }; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    const brokerProfiles = ${JSON.stringify(brokerProfiles)};
                </script>
        </head>
        <body>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}
