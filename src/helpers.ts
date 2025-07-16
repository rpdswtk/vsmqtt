import * as vscode from "vscode"
import MQTTMessage from "@common/interfaces/MqttMessage"
import csvWriter = require("csv-writer")
const createCsvWriter = csvWriter.createObjectCsvWriter

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
