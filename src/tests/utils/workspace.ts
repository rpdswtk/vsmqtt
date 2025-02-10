import * as fs from "node:fs"
import * as path from "node:path"
import { EditorView, InputBox, TextEditor, VSBrowser, Workbench } from "vscode-extension-tester"
import { BROKER_PROFILE } from "./constants.js"
import { randomBytes } from "node:crypto"

const TEST_PROJECT_FOLDER_PREFIX = "testProject"

export const initWorkspace = async (dirname: string): Promise<string> => {
  console.log("Initializing workspace")
  const folder = TEST_PROJECT_FOLDER_PREFIX + randomBytes(4).toString("hex")
  const projectPath = path.join(dirname, folder)
  console.log("Project path: ", projectPath)

  if (!fs.existsSync(projectPath)) {
    console.log("Creating folder...")
    fs.mkdirSync(projectPath)
  }

  console.log("Folder created")
  await VSBrowser.instance.openResources(projectPath)
  return projectPath
}

export const createSettingsWithProfile = async (
  projectPath: string,
  propertyOverrides = {}
): Promise<void> => {
  console.log("Creating settings.json")

  const settings = {
    "vsmqtt.brokerProfiles": [{ ...BROKER_PROFILE, ...propertyOverrides }],
  }

  await new Workbench().executeCommand("Create: New File...")
  const input = await InputBox.create(100000)
  await input.selectQuickPick("Text File")

  const editor = await new EditorView()

  const textEditor = (await editor.openEditor("Untitled-1")) as TextEditor

  await textEditor.setText(JSON.stringify(settings))

  await textEditor.save()

  await input.setText(path.join(projectPath, ".vscode/settings.json"))
  await input.confirm()

  if (await input.isDisplayed()) {
    await input.confirm()
  }

  console.log("settings file created")
}

export const closeWorkSpace = async (currentTest?: Mocha.Test): Promise<void> => {
  if (currentTest?.state === "passed") {
    await new Workbench().executeCommand("close workspace")
    console.log("Workspace closed")
  }
}
