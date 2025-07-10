import * as vscode from "vscode"
import MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"
import MQTTMessage from "@common/interfaces/MqttMessage"
import MqttSubscription from "@common/interfaces/MqttSubscription"
import csvWriter = require("csv-writer")
import { Uri, Webview } from "vscode"
const createCsvWriter = csvWriter.createObjectCsvWriter

export async function saveBrokerProfile(newProfile: MqttBrokerConfig): Promise<void> {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles")
  if (brokerProfiles) {
    const index = brokerProfiles?.findIndex((profile) => profile.name === newProfile.name)
    if (index !== undefined && index !== -1) {
      brokerProfiles[index] = newProfile
    } else {
      brokerProfiles.push(newProfile)
    }
    await config.update("brokerProfiles", brokerProfiles)
  }
}

export async function removeBrokerProfile(brokerProfile: MqttBrokerConfig): Promise<void> {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles")
  if (brokerProfiles) {
    const index = brokerProfiles?.findIndex((profile) => profile.name === brokerProfile.name)
    if (index !== undefined && index !== -1) {
      brokerProfiles.splice(index, 1)
      await config.update("brokerProfiles", brokerProfiles)
    }
  }
}

export async function loadBrokerProfiles(): Promise<MqttBrokerConfig[] | undefined> {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles")
  return brokerProfiles
}

export async function saveSubscription(
  brokerProfileName: string,
  subscription: MqttSubscription
): Promise<void> {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles")
  const brokerProfile = brokerProfiles?.find((profile) => profile.name === brokerProfileName)
  if (brokerProfile) {
    if (!brokerProfile.savedSubscriptions) {
      brokerProfile.savedSubscriptions = []
    }
    const index = brokerProfile.savedSubscriptions.findIndex((s) => s.topic === subscription.topic)
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
): Promise<void> {
  const config = await vscode.workspace.getConfiguration("vsmqtt")
  const brokerProfiles = await config.get<Array<MqttBrokerConfig>>("brokerProfiles")
  const brokerProfile = brokerProfiles?.find((profile) => profile.name === brokerProfileName)
  if (brokerProfile && brokerProfile.savedSubscriptions) {
    const index = brokerProfile.savedSubscriptions.findIndex((s) => s.topic === subscription.topic)
    if (index > -1) {
      brokerProfile.savedSubscriptions.splice(index, 1)
      await config.update("brokerProfiles", brokerProfiles)
    }
  }
}

export async function saveMessageLog(messages: MQTTMessage[]): Promise<void> {
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

export function getNonce(): string {
  let text = ""
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]): vscode.Uri {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList))
}

export async function openMqttMessageInEditor(payload: string): Promise<void> {
  const untitledIndex = vscode.workspace.textDocuments.filter((doc) => doc.isUntitled).length + 1

  const textDocument = await vscode.workspace.openTextDocument(
    vscode.Uri.file("untitled " + untitledIndex).with({ scheme: "untitled" })
  )

  const editor = await vscode.window.showTextDocument(textDocument)

  await editor.insertSnippet(new vscode.SnippetString(payload))

  const detectedLangaugeId = await waitForLanguageDetection(textDocument)
  if (detectedLangaugeId && detectedLangaugeId !== "plaintext") {
    await vscode.commands.executeCommand("editor.action.formatDocument")
  }
}

function waitForLanguageDetection(textDocument: vscode.TextDocument, timeout = 2000): Promise<string | null> {
  return new Promise((resolve) => {
    const disposable = vscode.workspace.onDidOpenTextDocument(async (document) => {
      if (document.uri === textDocument.uri) {
        disposable.dispose()
        resolve(document.languageId)
      }
    })

    setTimeout(() => {
      disposable.dispose()
      resolve(null)
    }, timeout)
  })
}
