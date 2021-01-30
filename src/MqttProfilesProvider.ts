import * as vscode from 'vscode';
import { loadBrokerProfiles } from './helpers';
import { MqttBrokerConfig } from './models/MqttBrokerConfig';

export class MqttProfilesProvider implements vscode.TreeDataProvider<BrokerProfileTreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<BrokerProfileTreeItem | undefined | void> = new vscode.EventEmitter<BrokerProfileTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<BrokerProfileTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    update() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: BrokerProfileTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: BrokerProfileTreeItem): Promise<BrokerProfileTreeItem[] | undefined> {
        try {
            let profiles = await loadBrokerProfiles();
            if (profiles) {
                let brokerProfiles = profiles.map((profile) => {
                    return new BrokerProfileTreeItem(
                        profile.name,
                        profile
                    );
                });
                return Promise.resolve(brokerProfiles);
            }
        } catch (error) {
            return Promise.reject([]);
        }
    }
}

export class BrokerProfileTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly brokerProfile: MqttBrokerConfig,
    ) {
        super(label);
    }
}
