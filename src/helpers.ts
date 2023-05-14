import * as vscode from "vscode"
import { MqttBrokerConfig } from "./interfaces/MqttBrokerConfig"
import { MQTTMessage } from "./interfaces/MqttMessage"
import { MqttSubscription } from "./interfaces/MqttSubscription"
import csvWriter = require("csv-writer")
const createCsvWriter = csvWriter.createObjectCsvWriter

export async function saveBrokerProfile(newProfile: MqttBrokerConfig) {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>(
    "brokerProfiles"
  )
  if (brokerProfiles) {
    const index = brokerProfiles?.findIndex(
      (profile) => profile.name === newProfile.name
    )
    if (index !== undefined && index !== -1) {
      brokerProfiles[index] = newProfile
    } else {
      brokerProfiles.push(newProfile)
    }
    await config.update("brokerProfiles", brokerProfiles)
  }
}

export async function removeBrokerProfile(brokerProfile: MqttBrokerConfig) {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>(
    "brokerProfiles"
  )
  if (brokerProfiles) {
    const index = brokerProfiles?.findIndex(
      (profile) => profile.name === brokerProfile.name
    )
    if (index !== undefined && index !== -1) {
      brokerProfiles.splice(index, 1)
      await config.update("brokerProfiles", brokerProfiles)
    }
  }
}

export async function loadBrokerProfiles(): Promise<
  MqttBrokerConfig[] | undefined
> {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>(
    "brokerProfiles"
  )
  return brokerProfiles
}

export async function saveSubscription(
  brokerProfileName: string,
  subscription: MqttSubscription
) {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>(
    "brokerProfiles"
  )
  const brokerProfile = brokerProfiles?.find(
    (profile) => profile.name === brokerProfileName
  )
  if (brokerProfile) {
    if (!brokerProfile.savedSubscriptions) {
      brokerProfile.savedSubscriptions = []
    }
    const index = brokerProfile.savedSubscriptions.findIndex(
      (s) => s.topic === subscription.topic
    )
    if (index === -1) {
      brokerProfile.savedSubscriptions.push(subscription)
    } else {
      brokerProfile.savedSubscriptions[index] = subscription
    }
    await config.update("brokerProfiles", brokerProfiles)
  }
}

export async function removeSavedSubscription(
  brokerProfileName: string,
  subscription: MqttSubscription
) {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>(
    "brokerProfiles"
  )
  const brokerProfile = brokerProfiles?.find(
    (profile) => profile.name === brokerProfileName
  )
  if (brokerProfile && brokerProfile.savedSubscriptions) {
    const index = brokerProfile.savedSubscriptions.findIndex(
      (s) => s.topic === subscription.topic
    )
    if (index > -1) {
      brokerProfile.savedSubscriptions.splice(index, 1)
      await config.update("brokerProfiles", brokerProfiles)
    }
  }
}

export async function saveMessageLog(messages: MQTTMessage[]) {
  let workspaceFolder = null
  if (vscode.workspace.workspaceFolders) {
    workspaceFolder = vscode.workspace.workspaceFolders[0]
  }
  const uri = await vscode.window.showSaveDialog({
    defaultUri: workspaceFolder?.uri,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    filters: { CommaSeparatedValues: ["csv"] },
  })
  if (uri) {
    const csvWriter = createCsvWriter({
      path: uri.fsPath,
      header: [
        { id: "timestamp", title: "TIMESTAMP" },
        { id: "topic", title: "TOPIC" },
        { id: "payload", title: "PAYLOAD" },
        { id: "retain", title: "RETAIN" },
        { id: "qos", title: "QOS" },
      ],
    })
    csvWriter.writeRecords(messages).then(() => {
      vscode.window.showInformationMessage(uri?.fsPath + " saved")
    })
  }
}

export function getNonce() {
  let text = ""
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
