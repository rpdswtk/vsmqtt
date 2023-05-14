// eslint-disable-next-line @typescript-eslint/no-var-requires
const rimraf = require("rimraf")

import * as fs from "node:fs"
import * as path from "node:path"
import { VSBrowser, Workbench } from "vscode-extension-tester"
import sleep from "./sleep"
import { BROKER_PROFILE } from "./constants"

const TEST_PROJECT_FOLDER = "testProject"

export const initWorkspace = async (dirname: string) => {
  console.log("Initializing workspace")
  const projectPath = path.join(dirname, TEST_PROJECT_FOLDER)
  console.log("Project path: ", projectPath)

  if (!fs.existsSync(projectPath)) {
    console.log("Creating folder...")
    fs.mkdirSync(projectPath)
  }

  console.log("Folder created")
  return await VSBrowser.instance.openResources(projectPath)
}

export const cleanWorkspace = async (dirname: string) => {
  console.log("Cleaning workspace")
  const projectPath = path.join(dirname, TEST_PROJECT_FOLDER)
  console.log("Project path: ", projectPath)

  await new Workbench().executeCommand("close workspace")
  console.log("Removing folder...")
  await rimraf(projectPath, function (error: Error) {
    if (error) {
      console.log("Could not remove test project folder")
      console.log(error)
    }
  })
  console.log("Folder removed")
  return await sleep(500)
}

export const createSettingsWithProfile = async (
  projectPath: string,
  propertyOverrides = {}
) => {
  const settings = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "vsmqtt.brokerProfiles": [{ ...BROKER_PROFILE, ...propertyOverrides }],
  }

  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath)
  }
  console.log("Creating .vscode folder")
  fs.mkdirSync(path.join(projectPath, ".vscode"))

  console.log("Creating settings.json")
  fs.appendFileSync(
    path.join(projectPath, ".vscode/settings.json"),
    JSON.stringify(settings)
  )
}
