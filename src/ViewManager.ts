import * as vscode from "vscode";
import { BaseMqttView } from "./BaseMqttView";
import { MqttBrokerConfig } from "./interfaces/MqttBrokerConfig";
import { MqttConnectionView } from "./MqttConnectionView";
import { MqttDashboardView } from "./MqttDashboardView";

export class ViewManager {

    private static openViews: Map<string, BaseMqttView> = new Map();

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
        let existingView = ViewManager.openViews.get(ViewManager.getViewID(brokerConfig.name, viewType));
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

        ViewManager.openViews.set(ViewManager.getViewID(brokerConfig.name, viewType), newView);
    }

    private static onViewDisposed(brokerconfig: MqttBrokerConfig, viewType: string) {
        ViewManager.openViews.delete(ViewManager.getViewID(brokerconfig.name, viewType));
    }

    private static getViewID(brokerProfilename: string, viewType: string) {
        return `${brokerProfilename}-${viewType}`;
    }
}