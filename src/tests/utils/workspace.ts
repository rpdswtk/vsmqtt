import * as fs from "node:fs"
import * as path from "node:path"
import { VSBrowser, Workbench } from "vscode-extension-tester"
import sleep from "./sleep.js"
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
  await VSBrowser.instance.waitForWorkbench()
  return projectPath
}

export const createSettingsWithProfile = async (
  projectPath: string,
  propertyOverrides = {}
): Promise<void> => {
  const settings = {
    "vsmqtt.brokerProfiles": [{ ...BROKER_PROFILE, ...propertyOverrides }],
  }

  console.log("Creating .vscode folder")
  fs.mkdirSync(path.join(projectPath, ".vscode"))

  console.log("Creating settings.json")
  fs.appendFileSync(path.join(projectPath, ".vscode/settings.json"), JSON.stringify(settings))
  console.log("settings file created")
  await sleep(1000)
}

export const closeWorkSpace = async (currentTest?: Mocha.Test): Promise<void> => {
  if (currentTest?.state === "passed") {
    await new Workbench().executeCommand("close workspace")
  }
}
