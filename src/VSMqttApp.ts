import * as vscode from 'vscode';
import { loadBrokerProfiles, removeBrokerProfile, saveBrokerProfile } from './helpers';
import { MqttConnectionView } from "./MqttConnectionView";
import { BrokerProfileTreeItem, MqttProfilesProvider } from "./MqttProfilesProvider";

export class VSMqttApp {

    private _profilesProvider: MqttProfilesProvider;
    private _context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this._profilesProvider = new MqttProfilesProvider();
        this._context = context;

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
            vscode.commands.registerCommand('vsmqtt.connectToBroker', async (item) => {
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
            vscode.commands.registerCommand("vsmqtt.deleteProfile", async (item) => {
                await this._deleteProfile(item);
            })
        );

        this._context.subscriptions.push(
            vscode.commands.registerCommand('vsmqtt.refreshProfileList', async () => {
                await this._profilesProvider.update();
            })
        );
    }

    private async _connectToBroker(treeItem: BrokerProfileTreeItem) {
        if (treeItem) {
            var brokerConfig = treeItem.brokerProfile;
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
        MqttConnectionView.createOrShow(this._context.extensionUri, brokerConfig);
    }

    private async _addProfile() {
        let name = await vscode.window.showInputBox({
            prompt: "Profile name"
        });
        if (!name) { return; }

        let address = await vscode.window.showInputBox({
            prompt: "Address",
            placeHolder: "localhost",
        });
        if (!address) { return; }

        let port = await vscode.window.showInputBox({
            prompt: "Port",
            placeHolder: "1883"
        });
        if (!port) { return; }

        await saveBrokerProfile({ name, address, port: parseInt(port), clientID: "vsmqtt_client" });
        this._profilesProvider.update();
    }

    private async _deleteProfile(treeItem: BrokerProfileTreeItem) {
        const result = await vscode.window.showWarningMessage(
            `Are you sure you want to delete profile: ${treeItem.brokerProfile.name} ?`,
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
    }
}