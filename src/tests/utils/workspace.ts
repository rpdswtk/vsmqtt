import { randomBytes } from "node:crypto"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  EditorView,
  InputBox,
  Key,
  ModalDialog,
  NotificationsCenter,
  TextEditor,
  VSBrowser,
  Workbench,
} from "vscode-extension-tester"
import { BROKER_PROFILE } from "./constants.js"
import { log } from "./logging.js"
import sleep from "./sleep.js"

const TEST_PROJECT_FOLDER_PREFIX = "testProject"

export const initWorkspace = async (dirname: string): Promise<string> => {
  await VSBrowser.instance.waitForWorkbench()
  await sleep(500)
  log("Initializing workspace")
  const folder = TEST_PROJECT_FOLDER_PREFIX + randomBytes(4).toString("hex")
  const projectPath = path.join(dirname, folder)
  log("Project path: " + projectPath)

  if (!fs.existsSync(projectPath)) {
    log("Creating folder...")
    fs.mkdirSync(projectPath)
  }

  log("Folder created")
  await openWorkSpace(projectPath)
  await sleep(5000)
  return projectPath
}

export const createSettingsWithProfile = async (
  projectPath: string,
  propertyOverrides = {}
): Promise<void> => {
  log("Creating settings.json")

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

  await input.confirm()

  await sleep(500) // let VS Code dismiss the overlay
  log("Settings file created")
}

export const closeWorkSpace = async (currentTest?: Mocha.Test): Promise<void> => {
  if (currentTest?.state === "passed" || currentTest?.state === "failed") {
    try {
      const dialog = new ModalDialog()
      await dialog.wait(2000)
      await VSBrowser.instance.driver.actions().sendKeys(Key.ESCAPE).perform()
      await sleep(300)
    } catch (e) {
      // No modal, continue normally
    }

    await VSBrowser.instance.waitForWorkbench()
    await new Workbench().executeCommand("close workspace")
    log("Workspace closed")
  }
}

export const openWorkSpace = async (projectPath: string): Promise<void> => {
  await VSBrowser.instance.waitForWorkbench()
  await sleep(1500)

  // Dismiss any lingering quickinput overlay from the previous test
  try {
    await VSBrowser.instance.driver.actions().sendKeys(Key.ESCAPE).perform()
    await sleep(300)
  } catch (e) {
    // ignore
  }

  try {
    const center = new NotificationsCenter()
    await center.clearAllNotifications()
    await center.close()
    await sleep(300)
  } catch (e) {
    // No notifications, continue
  }

  await safeCloseAllEditors()

  log("Opening project folder: " + projectPath)

  const prompt = await new Workbench().openCommandPrompt()

  const input = await InputBox.create(15000)

  await prompt.setText(">workbench.action.files.openFolder")
  await prompt.confirm()

  await input.setText(projectPath)
  await input.confirm()
  log("Project folder opened")
}

const safeCloseAllEditors = async (): Promise<void> => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await new Workbench().executeCommand("workbench.action.closeAllEditors")
      await sleep(300)
      return
    } catch (e) {
      // swallow all errors — closing editors is best-effort
      await sleep(500)
    }
  }
}
