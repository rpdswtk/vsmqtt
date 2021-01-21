import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import { saveBrokerProfile } from './helpers';
import { MqttBrokerConfig } from "./models/MqttBrokerConfig";

export class MqttConfigPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: MqttConfigPanel | undefined;

    public static readonly viewType = "mqtt-config";

    public readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _brokerConfig: MqttBrokerConfig;

    public static createOrShow(extensionUri: vscode.Uri, brokerConfig: MqttBrokerConfig) {

        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (MqttConfigPanel.currentPanel) {
            MqttConfigPanel.currentPanel._panel.reveal(column);
            MqttConfigPanel.currentPanel._update(brokerConfig);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            MqttConfigPanel.viewType,
            "Mqtt config",
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,

                // And restrict the webview to only loading content from our extension's `media` directory.
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, "media"),
                    vscode.Uri.joinPath(extensionUri, "out/compiled"),
                ],
            }
        );

        MqttConfigPanel.currentPanel = new MqttConfigPanel(panel, extensionUri, brokerConfig);
    }

    public static kill() {
        MqttConfigPanel.currentPanel?.dispose();
        MqttConfigPanel.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, brokerConfig: MqttBrokerConfig) {
        MqttConfigPanel.currentPanel = new MqttConfigPanel(panel, extensionUri, brokerConfig);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, brokerConfig: MqttBrokerConfig) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._brokerConfig = brokerConfig;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(async (data) => {
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
                case "save-mqtt-profile": {
                    if (!data.value) {
                        return;
                    }
                    await saveBrokerProfile(data.value);
                    MqttConfigPanel.kill();
                    break;
                }
            }
        });
    }

    public dispose() {
        MqttConfigPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        this._panel.webview.onDidReceiveMessage(() => {});

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }

    }

    private async _update(brokerConfig?: MqttBrokerConfig) {  
        const webview = this._panel.webview;

        this._panel.webview.html = this._getHtmlForWebview(webview);

        if (brokerConfig) {
            this._brokerConfig = brokerConfig;
        }

        this._panel.webview.postMessage({
            type: "update-broker-profile",
            data: this._brokerConfig
        });

        // webview.onDidReceiveMessage(async (data) => {
        //     switch (data.type) {
        //         case "onInfo": {
        //             if (!data.value) {
        //                 return;
        //             }
        //             vscode.window.showInformationMessage(data.value);
        //             break;
        //         }
        //         case "onError": {
        //             if (!data.value) {
        //                 return;
        //             }
        //             vscode.window.showErrorMessage(data.value);
        //             break;
        //         }
        //         case "add-mqtt-profile": {
        //             if (!data.value) {
        //                 return;
        //             }
        //             console.log("GICIGECI");
        //             await saveBrokerProfile(data.value);
        //             break;
        //         }
        //     }
        // });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/MqttConfigPanel.js")
        );

        const stylesPageUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/MqttConfigPanel.css")
        );

        const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this._extensionUri,
            "media",
            "reset.css"
        ));

        const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this._extensionUri,
            "media",
            "vscode.css"
        ));

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                    Use a content security policy to only allow loading images from https or from our extension directory,
                    and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${stylesResetUri}" rel="stylesheet">
                <link href="${stylesMainUri}" rel="stylesheet">
                <link href="${stylesPageUri}" rel="stylesheet">
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                    const brokerProfile = ${JSON.stringify(this._brokerConfig)};
                </script>
            </head>
            <body>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}