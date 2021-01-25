import * as vscode from 'vscode';
import { loadBrokerProfiles } from './helpers';

export class MqttProfilesProvider implements vscode.TreeDataProvider<BrokerProfile> {

    private _onDidChangeTreeData: vscode.EventEmitter<BrokerProfile | undefined | void> = new vscode.EventEmitter<BrokerProfile | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<BrokerProfile | undefined | null | void> = this._onDidChangeTreeData.event;

    update() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: BrokerProfile): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: BrokerProfile): Promise<BrokerProfile[] | undefined> {
        try {
            let profiles = await loadBrokerProfiles();
            if (profiles) {
                let brokerProfiles = profiles.map((profile) => {
                    return new BrokerProfile(
                        profile.name,
                        profile.address,
                        profile.port.toString()
                    );
                });
                return Promise.resolve(brokerProfiles);
            }
        } catch (error) {
            return Promise.reject([]);
        }
    }
}

class BrokerProfile extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private address: string,
        public tooltip: string
    ) {
        super(label);
    }
}
