import * as vscode from "vscode"
import MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"
import { MqttProfileQuickPickItem } from "./interfaces/MqttProfileQuickPickItem"
import { MqttConnectionView } from "./panels/MqttConnectionView"
import { BrokerProfileTreeItem, MqttProfilesProvider } from "./MqttProfilesProvider"
import { randomBytes } from "crypto"
import BrokerProfileManager from "./BrokerProfileManager"

export class VSMqttApp {
  private _profilesProvider: MqttProfilesProvider
  private _context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext) {
    this._profilesProvider = new MqttProfilesProvider()
    this._context = context

    context.subscriptions.push(vscode.window.registerTreeDataProvider("mqttProfiles", this._profilesProvider))

    vscode.workspace.onDidChangeConfiguration(() => {
      this._profilesProvider.update()
    })

    this._initCommands()
  }

  private _initCommands() {
    this._context.subscriptions.push(
      vscode.commands.registerCommand("vsmqtt.connectToBroker", async (item) => {
        await this._connectToBroker(item)
      })
    )

    this._context.subscriptions.push(
      vscode.commands.registerCommand("vsmqtt.addProfile", async () => {
        await this._addProfile()
      })
    )

    this._context.subscriptions.push(
      vscode.commands.registerCommand("vsmqtt.editProfile", async () => {
        await vscode.commands.executeCommand("workbench.action.openWorkspaceSettingsFile")
      })
    )

    this._context.subscriptions.push(
      vscode.commands.registerCommand("vsmqtt.deleteProfile", async (item: BrokerProfileTreeItem) => {
        await this._deleteProfile(item)
      })
    )

    this._context.subscriptions.push(
      vscode.commands.registerCommand("vsmqtt.refreshProfileList", async () => {
        await this._profilesProvider.update()
      })
    )
  }

  private async _connectToBroker(treeItem: BrokerProfileTreeItem) {
    let brokerConfig = null
    if (treeItem) {
      brokerConfig = treeItem.brokerProfile
    } else {
      const profiles = await BrokerProfileManager.loadBrokerProfiles()

      if (!profiles) {
        return
      }

      const selectedProfileName = await vscode.window.showQuickPick(profiles?.map((profile) => profile.name))

      if (!selectedProfileName) {
        return
      }

      const selectedProfile = profiles.find((profile) => {
        return profile.name === selectedProfileName
      })

      if (!selectedProfile) {
        return
      }

      brokerConfig = selectedProfile
    }

    if (brokerConfig.promptCredentials) {
      const { username, password } = await this._showPromptForCredentials()
      brokerConfig.username = username
      brokerConfig.password = password
    }

    MqttConnectionView.createOrShow(this._context.extensionUri, brokerConfig)
  }

  private async _addProfile() {
    const name = await vscode.window.showInputBox({
      prompt: "Profile name",
    })
    if (!name) {
      return
    }

    let host = await vscode.window.showInputBox({
      prompt: "Host",
      placeHolder: "localhost",
    })
    if (!host) {
      host = "localhost"
    }

    let port = await vscode.window.showInputBox({
      prompt: "Port",
      placeHolder: "1883",
    })
    if (!port) {
      port = "1883"
    }

    await BrokerProfileManager.saveBrokerProfile({
      name,
      host,
      port: parseInt(port),
      clientId: `vsmqtt_client_${randomBytes(2).toString("hex")}`,
    })
    this._profilesProvider.update()
  }

  private async _deleteProfile(treeItem: BrokerProfileTreeItem) {
    let brokerProfile = treeItem?.brokerProfile
    if (!brokerProfile) {
      const quickPickResult = await this._getBrokerProfileWithQuickPick()
      if (quickPickResult) {
        brokerProfile = quickPickResult as MqttBrokerConfig
      }
    }

    const profileName = brokerProfile?.name
    const result = await vscode.window.showWarningMessage(
      `Are you sure you want to delete profile: ${profileName} ?`,
      {
        modal: true,
      },
      "Yes",
      "No"
    )

    if (!result || result === "No") {
      return
    }

    await BrokerProfileManager.removeBrokerProfile(brokerProfile)
    this._profilesProvider.update()
    MqttConnectionView.kill(brokerProfile)
  }

  private async _getBrokerProfileWithQuickPick(): Promise<MqttBrokerConfig | undefined> {
    const profiles = await BrokerProfileManager.loadBrokerProfiles()
    if (profiles) {
      const profileName = await vscode.window.showQuickPick(
        profiles.map((profile) => {
          return {
            label: profile.name,
            description: "",
            detail: `Host: ${profile.host} Port: ${profile.port}`,
            ...profile,
          } as MqttProfileQuickPickItem
        })
      )

      return profileName
    }
  }

  private async _showPromptForCredentials(): Promise<{
    username?: string
    password?: string
  }> {
    const username = await vscode.window.showInputBox({ prompt: "Username" })
    const password = await vscode.window.showInputBox({ prompt: "Password" })

    return { username, password }
  }
}
