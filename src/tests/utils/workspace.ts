import * as fs from "node:fs"
import * as path from "node:path"
import { VSBrowser } from "vscode-extension-tester"
import sleep from "./sleep"
import { BROKER_PROFILE } from "./constants"
import { randomBytes } from "node:crypto"

const TEST_PROJECT_FOLDER_PREFIX = "testProject"

export const initWorkspace = async (dirname: string) => {
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
) => {
  const settings = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "vsmqtt.brokerProfiles": [{ ...BROKER_PROFILE, ...propertyOverrides }],
  }

  console.log("Creating .vscode folder")
  fs.mkdirSync(path.join(projectPath, ".vscode"))

  console.log("Creating settings.json")
  fs.appendFileSync(
    path.join(projectPath, ".vscode/settings.json"),
    JSON.stringify(settings)
  )
  console.log("settings file created")
  await sleep(1000)
}
