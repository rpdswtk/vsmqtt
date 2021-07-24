import { AsyncClient } from "async-mqtt";
import * as vscode from "vscode";
import { getNonce } from "./helpers";
import { MqttBrokerConfig } from "./interfaces/MqttBrokerConfig";
import { MqttClientFactory } from "./MqttClientFactory";
import { IPublishPacket } from 'mqtt-packet';
import moment = require("moment");


export abstract class BaseMqttView {
    public static viewType: string;
    public brokerConfig: MqttBrokerConfig;
    public readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _mqttClient?: AsyncClient;
    private viewFileName: string;
    private _messageCount: number;

    protected abstract handleMessages(data: any): void;

    public constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, brokerConfig: MqttBrokerConfig, viewFileName: string, onDisposeListener: any) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this.brokerConfig = brokerConfig;
        this._messageCount = 0;
        this.viewFileName = viewFileName;

        // Set the webview's initial html content
        this._update();

        this._panel.webview.onDidReceiveMessage(async (data) => {
            this.handleBaseMessages(data);
            this.handleMessages(data);
        });

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => {
            onDisposeListener();
            this.dispose();
        }, null, this._disposables);
    }

    private async handleBaseMessages(data: any) {
        switch(data.type) {
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
    }

    public dispose() {
        //MqttClientFactory.disposeClient(this.brokerConfig);

        // Clean up our resources
        this._panel.webview.onDidReceiveMessage(() => { });
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    public async _update() {
        const webview = this._panel.webview;
        this._initMqtt();
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _initMqtt() {
        this._mqttClient = MqttClientFactory.createClient(this.brokerConfig);

        this._mqttClient.once('error', async () => {
            const result = await vscode.window.showErrorMessage(`Could not connect to ${this.brokerConfig.host}`, "Open settings.json");
            if (result) {
                await vscode.commands.executeCommand("workbench.action.openWorkspaceSettingsFile");
            }
        });

        this._mqttClient.on("message", (topic, message, packet: IPublishPacket) => {
            var timestamp = moment().format('YYYY-MM-DD h:mm:ss.SSS');
            console.log(`${timestamp} - Message received ${topic} Retain: ${packet.retain} Qos: ${packet.qos}`);
            this._panel?.webview.postMessage({
                type: "onMqttMessage",
                value: { 
                    id: this._messageCount++,
                    topic,
                    payload: message.toString(),
                    qos: packet.qos,
                    retain: packet.retain,
                    timestamp 
                }
            });
        });

        this._mqttClient.on('connect', () => {
            this._panel?.webview.postMessage({
                type: "onMqttConnectionChange",
                value: { connected: true }
            });

            this._mqttClient?.once('error', () => {
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
            vscode.Uri.joinPath(this._extensionUri, "out", `compiled/${this.viewFileName}.js`)
        );

        const stylesPageUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out",  `compiled/${this.viewFileName}.css`)
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
                    const brokerProfile = ${JSON.stringify(this.brokerConfig)};
                </script>
            </head>
            <body>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}