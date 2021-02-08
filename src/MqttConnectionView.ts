import { AsyncClient } from "async-mqtt";
import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import { MqttBrokerConfig } from "./models/MqttBrokerConfig";
import { MqttClientFactory } from "./MqttClientFactory";
import { IPublishPacket } from 'mqtt-packet';
import moment = require("moment");

export class MqttConnectionView {
    public static currentPanel: MqttConnectionView | undefined;

    public static readonly viewType = "mqtt-connection";

    public readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _brokerConfig: MqttBrokerConfig;
    private _mqttClient?: AsyncClient;

    public static createOrShow(extensionUri: vscode.Uri, brokerConfig: MqttBrokerConfig) {

        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (MqttConnectionView.currentPanel) {
            MqttConnectionView.currentPanel._panel.reveal(column);
            MqttConnectionView.currentPanel._update(brokerConfig);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            MqttConnectionView.viewType,
            "VSMQTT",
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

        MqttConnectionView.currentPanel = new MqttConnectionView(panel, extensionUri, brokerConfig);
    }

    public static kill() {
        MqttConnectionView.currentPanel?.dispose();
        MqttConnectionView.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, brokerConfig: MqttBrokerConfig) {
        MqttConnectionView.currentPanel = new MqttConnectionView(panel, extensionUri, brokerConfig);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, brokerConfig: MqttBrokerConfig) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._brokerConfig = brokerConfig;

        // Set the webview's initial html content
        this._update();

        this._panel.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "publish": {
                    if (!data.value) {
                        return;
                    }
                    console.log(`Publishing to topic: ${data.value.topic} QoS: ${data.value.qos} Retain: ${data.value.retain}`);
                    await this._mqttClient?.publish(data.value.topic,
                        data.value.payload, { qos: data.value.qos, retain: data.value.retain });
                    break;
                }
                case "subscribe": {
                    if (!data.value) {
                        return;
                    }
                    console.log(`Subscribing to topic: ${data.value.topic} QoS: ${data.value.qos}`);
                    this._mqttClient?.subscribe(data.value.topic, { qos: data.value.qos });
                    break;
                }
                case "unsubscribe": {
                    if (!data.value) {
                        return;
                    }
                    console.log(`Unsubscribing from topic: ${data.value.topic}`);
                    await this._mqttClient?.unsubscribe(data.value.topic);
                    break;
                }
            }
        });

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        MqttConnectionView.currentPanel = undefined;
        MqttClientFactory.disposeClient(this._brokerConfig);

        // Clean up our resources
        this._panel.dispose();

        this._panel.webview.onDidReceiveMessage(() => { });

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update(brokerConfig?: MqttBrokerConfig) {
        const webview = this._panel.webview;
        if (brokerConfig) {
            if (this._brokerConfig.name !== brokerConfig.name) {
                // disposing previous client
                MqttClientFactory.disposeClient(this._brokerConfig);
            }

            this._brokerConfig = brokerConfig;

            this._panel?.webview.postMessage({
                type: "onMqttProfileChange",
                value: { brokerConfig: this._brokerConfig }
            });
        }

        this._mqttClient = MqttClientFactory.createClient(this._brokerConfig);

        this._mqttClient.once('error', () => {
            vscode.window.showErrorMessage(`Could not connect to ${this._brokerConfig.address}`);
        });

        this._mqttClient.on("message", (topic, message, packet: IPublishPacket) => {
            var timestamp = moment().format('YYYY-MM-DD h:mm:ss.SSS');
            console.log(`${timestamp} - Message received ${topic} Retain: ${packet.retain} Qos: ${packet.qos}`);
            this._panel?.webview.postMessage({
                type: "onMqttMessage",
                value: { topic, payload: message.toString(), qos: packet.qos, retain: packet.retain, timestamp }
            });
        });

        this._panel.webview.html = this._getHtmlForWebview(webview);

        this._mqttClient.on('connect', () => {
            vscode.window.showInformationMessage(`Connected to ${this._brokerConfig.address}`);

            this._panel?.webview.postMessage({
                type: "onMqttConnectionChange",
                value: { connected: true }
            });

            this._mqttClient?.once('error', () => {
                vscode.window.showErrorMessage(`Disconnected from ${this._brokerConfig.address}`);

                this._panel?.webview.postMessage({
                    type: "onMqttConnectionChange",
                    value: { connected: false }
                });
            });
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/MqttConnectionPanel.js")
        );

        const stylesPageUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/MqttConnectionPanel.css")
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