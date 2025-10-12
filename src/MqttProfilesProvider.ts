import * as vscode from "vscode"
import MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"
import BrokerProfileManager from "./BrokerProfileManager"

export class MqttProfilesProvider implements vscode.TreeDataProvider<BrokerProfileTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<BrokerProfileTreeItem | undefined | void> =
    new vscode.EventEmitter<BrokerProfileTreeItem | undefined | void>()
  readonly onDidChangeTreeData: vscode.Event<BrokerProfileTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event

  update(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: BrokerProfileTreeItem): vscode.TreeItem {
    return element
  }

  async getChildren(_element?: BrokerProfileTreeItem): Promise<BrokerProfileTreeItem[] | undefined> {
    try {
      const profiles = await BrokerProfileManager.loadBrokerProfiles()
      if (profiles) {
        const brokerProfiles = profiles.map((profile) => {
          return new BrokerProfileTreeItem(profile.name, profile)
        })
        return Promise.resolve(brokerProfiles)
      }
    } catch (error) {
      return Promise.reject([])
    }
  }
}

export class BrokerProfileTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly brokerProfile: MqttBrokerConfig
  ) {
    super(label)
  }
}
