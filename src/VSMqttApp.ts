import * as vscode from 'vscode';
import { loadBrokerProfiles, removeBrokerProfile, saveBrokerProfile } from './helpers';
import { MqttConnectionView } from "./MqttConnectionView";
import { MqttDashboardView } from './MqttDashboardView';
import { BrokerProfileTreeItem, MqttProfilesProvider } from "./MqttProfilesProvider";
import { ViewManager } from './ViewManager';

export class VSMqttApp {

    private _profilesProvider: MqttProfilesProvider;
    private _context: vscode.ExtensionContext;
    private _viewManager: ViewManager;

    constructor(context: vscode.ExtensionContext) {
        this._profilesProvider = new MqttProfilesProvider();
        this._context = context;
        this._viewManager = new ViewManager(this._context.extensionUri);

        context.subscriptions.push(
            vscode.window.registerTreeDataProvider(
                "mqttProfiles",
                this._profilesProvider
            )
        );

        vscode.workspace.onDidChangeConfiguration(() => {
            this._profilesProvider.update();
        });

        this._initCommands();
    }

    private _initCommands() {
        this._context.subscriptions.push(
            vscode.commands.registerCommand('vsmqtt.connectToBroker', async (item: BrokerProfileTreeItem) => {
                await this._connectToBroker(item);
            })
        );

        this._context.subscriptions.push(
            vscode.commands.registerCommand("vsmqtt.addProfile", async () => {
                await this._addProfile();
            })
        );

        this._context.subscriptions.push(
            vscode.commands.registerCommand("vsmqtt.editProfile", async () => {
                await vscode.commands.executeCommand("workbench.action.openWorkspaceSettingsFile");
            })
        );

        this._context.subscriptions.push(
            vscode.commands.registerCommand("vsmqtt.deleteProfile", async (item: BrokerProfileTreeItem) => {
                await this._deleteProfile(item);
            })
        );

        this._context.subscriptions.push(
            vscode.commands.registerCommand('vsmqtt.refreshProfileList', async () => {
                await this._profilesProvider.update();
            })
        );

        this._context.subscriptions.push(
            vscode.commands.registerCommand('vsmqtt.openMqttDashboard', async (item: BrokerProfileTreeItem) => {
                await this._openDashboard(item);
            })
        );
    }

    private async _connectToBroker(treeItem: BrokerProfileTreeItem) {
        let brokerConfig = await VSMqttApp._getBrokerConfig(treeItem);
        if (brokerConfig) {
            this._viewManager.createOrShow(brokerConfig, MqttConnectionView.viewType);
        }
    }

    private async _addProfile() {
        let name = await vscode.window.showInputBox({
            prompt: "Profile name"
        });
        if (!name) { return; }

        let host = await vscode.window.showInputBox({
            prompt: "Host",
            placeHolder: "localhost",
        });
        if (!host) {
            host = "localhost";
        }

        let port = await vscode.window.showInputBox({
            prompt: "Port",
            placeHolder: "1883"
        });
        if (!port) {
            port = "1883";
        }

        await saveBrokerProfile({ name, host, port: parseInt(port), clientId: "vsmqtt_client" });
        this._profilesProvider.update();
    }

    private async _deleteProfile(treeItem: BrokerProfileTreeItem) {
        const profileName = treeItem.brokerProfile.name;
        const result = await vscode.window.showWarningMessage(
            `Are you sure you want to delete profile: ${profileName} ?`,
            {
                modal: true
            },
            "Yes",
            "No"
        );
        if (!result || result === "No") {
            return;
        }
        await removeBrokerProfile(treeItem.brokerProfile);
        this._profilesProvider.update();
        ViewManager.getViewTypes().forEach(viewType => ViewManager.close(treeItem.brokerProfile, viewType));
    }

    private async _openDashboard(treeItem: BrokerProfileTreeItem) {
        let brokerConfig = await VSMqttApp._getBrokerConfig(treeItem);
        if (brokerConfig) {
            this._viewManager.createOrShow(brokerConfig, MqttDashboardView.viewType);
        }
    }

    private static async _getBrokerConfig(treeItem: BrokerProfileTreeItem | undefined) {
        var brokerConfig = null;
        if (treeItem) {
            brokerConfig = treeItem.brokerProfile;
        } else {
            let profiles = await loadBrokerProfiles();
            if (!profiles) { return; }
            let selectedProfileName = await vscode.window.showQuickPick(profiles?.map(profile => profile.name));
            if (!selectedProfileName) { return; }
            let selectedProfile = profiles.find((profile) => {
                return profile.name === selectedProfileName;
            });
            if (!selectedProfile) { return; }
            brokerConfig = selectedProfile;
        }

        return brokerConfig;
    }
}