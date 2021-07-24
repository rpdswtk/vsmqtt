import * as vscode from "vscode";
import { BaseMqttView } from "./BaseMqttView";
import { MqttBrokerConfig } from "./interfaces/MqttBrokerConfig";
import { MqttConnectionView } from "./MqttConnectionView";
import { MqttDashboardView } from "./MqttDashboardView";

export class ViewManager {

    private static openViewTypes: Map<string, Map<string, BaseMqttView>> = new Map();

    private static viewTypes = new Map<string, any>();

    constructor(private extensionUri: vscode.Uri) {
        ViewManager.viewTypes.set(MqttConnectionView.viewType, MqttConnectionView);
        ViewManager.viewTypes.set(MqttDashboardView.viewType, MqttDashboardView);
    }

    public createOrShow(brokerConfig: MqttBrokerConfig, viewType: string) {
        const column = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

        // If we already have a panel, show it.
        let existingView = ViewManager.openViewTypes.get(viewType)?.get(brokerConfig.name);
        if (existingView) {
            existingView._panel.reveal(column);
            return;
        }
        
         // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            viewType,
            "VSMQTT",
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,
                retainContextWhenHidden: true,

                // And restrict the webview to only loading content from our extension's `media` directory.
                localResourceRoots: [
                    vscode.Uri.joinPath(this.extensionUri, "media"),
                    vscode.Uri.joinPath(this.extensionUri, "out/compiled"),
                ],
            }
        );

        let selectedType = ViewManager.viewTypes.get(viewType);
        let newView = new selectedType(panel, this.extensionUri, brokerConfig, viewType, () => {
            ViewManager.onViewDisposed(brokerConfig, viewType);
        });
        if (!ViewManager.openViewTypes.has(viewType)) {
            ViewManager.openViewTypes.set(viewType, new Map());
        }

        ViewManager.openViewTypes.get(viewType)?.set(brokerConfig.name, newView);
    }

    private static onViewDisposed(brokerconfig: MqttBrokerConfig,viewType: string) {
        ViewManager.openViewTypes.get(viewType)?.delete(brokerconfig.name);
    }
}