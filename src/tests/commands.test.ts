import { expect } from "chai"
import * as fs from "node:fs"
import * as path from "path"
import { By, EditorView, InputBox, ModalDialog, VSBrowser, WebView, Workbench } from "vscode-extension-tester"
import { BROKER_PROFILE, WEBSOCKET_PORT } from "./utils/constants.js"
import { log } from "./utils/logging.js"
import sleep from "./utils/sleep.js"
import { closeWorkSpace, createSettingsWithProfile, initWorkspace } from "./utils/workspace.js"

describe("Commands", function () {
  let projectPath: string

  this.beforeEach(async function () {
    log(`Starting test setup for: ${this.currentTest?.title || "unknown"}`)
    projectPath = await initWorkspace(__dirname)
  })

  this.afterEach(async function () {
    closeWorkSpace(this.currentTest)
    log(`Finished test cleanup for: ${this.currentTest?.title || "unknown"}`)
  })

  describe("Add broker profile", () => {
    this.retries(3)

    it.skip("saves profile to settings.json", async function () {
      await new Workbench().executeCommand("add broker profile")

      const input = await InputBox.create()
      await input.wait()
      await input.setText(BROKER_PROFILE.name)
      await input.confirm()
      await input.setText(BROKER_PROFILE.host)
      await input.confirm()
      await input.setText(BROKER_PROFILE.port.toString())
      await input.confirm()

      await sleep(2000)
      const rawData = fs.readFileSync(path.join(projectPath, ".vscode/settings.json"))
      const settings = JSON.parse(rawData.toString())

      const savedProfile = settings["vsmqtt.brokerProfiles"][0]

      expect(savedProfile.name).to.equal(BROKER_PROFILE.name)
      expect(savedProfile.host).to.equal(BROKER_PROFILE.host)
      expect(savedProfile.port).to.equal(BROKER_PROFILE.port)
      log(`Finished test: ${this.test?.title || "unknown"}`)
    })
  })

  describe("Remove broker profile", () => {
    this.retries(3)

    it("removes profile from settings.json", async function () {
      await createSettingsWithProfile(projectPath)

      log("Removing broker profile")
      await new Workbench().executeCommand("remove broker profile")
      const input = await InputBox.create()
      await sleep(2000)

      log("Selecting broker profile to remove")
      await input.selectQuickPick(0)

      log("Confirming removal")
      const dialog = new ModalDialog()
      await VSBrowser.instance.waitForWorkbench()
      await dialog.pushButton("Yes")

      log("Opening editor")
      const settingsFile = await new EditorView().openEditor("settings.json")

      const settingsText = await settingsFile.getText()

      const settings = JSON.parse(settingsText)

      expect(settings["vsmqtt.brokerProfiles"]).to.not.deep.include.members([BROKER_PROFILE])
    })
  })

  describe("Edit broker profile", () => {
    this.retries(3)

    it("opens settings.json", async function () {
      log("Editing broker profile")
      await new Workbench().executeCommand("Edit broker profile")
      await sleep(2000)

      const editorView = new EditorView()

      const titles = await editorView.getOpenEditorTitles()

      expect(titles).to.contain("settings.json")
    })
  })

  describe("Connect to mqtt broker", () => {
    this.retries(3)

    it("connects to broker", async function () {
      log("Refreshing broker profile list")
      await new Workbench().executeCommand("VSMQTT: Refresh broker profile list")

      await createSettingsWithProfile(projectPath)

      log("Connecting to mqtt broker")
      await new Workbench().executeCommand("Connect to mqtt broker")
      const input = await InputBox.create()
      await input.selectQuickPick(0)

      log("Opening mqtt webview")
      const webview = await new EditorView().openEditor("VSMQTT")
      webview.wait()
      const mqttView = new WebView()
      await mqttView.switchToFrame()

      log("Checking connection state")
      const connectionState = await mqttView.findWebElement(By.className("status"))
      expect(await connectionState.getText()).to.equal("ONLINE")
      await mqttView.switchBack()
    })

    it("prompts for password", async function () {
      await createSettingsWithProfile(projectPath, { promptCredentials: true })

      log("Connecting to mqtt broker with prompted credentials")
      await new Workbench().executeCommand("Connect to mqtt broker")
      const input = await InputBox.create()
      await input.selectQuickPick(0)

      await sleep(2000)

      log("Waiting for username prompt")
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(await (await input.getMessage()).startsWith("Username"), "Should be username").to.be.true
      await input.setText("user")
      await input.confirm()

      log("Waiting for password prompt")
      await input.wait()
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(await (await input.getMessage()).startsWith("Password"), "Should be password").to.be.true
      await input.cancel()
    })

    it("connects to broker using websocket", async function () {
      await createSettingsWithProfile(projectPath, {
        host: "ws://localhost",
        port: WEBSOCKET_PORT,
        protocol: "ws",
      })

      log("Connecting to mqtt broker over websocket")
      await new Workbench().executeCommand("Connect to mqtt broker")
      const input = await InputBox.create()
      await input.selectQuickPick(0)

      log("Opening mqtt webview")
      const webview = await new EditorView().openEditor("VSMQTT")
      webview.wait()
      const mqttView = new WebView()
      await mqttView.switchToFrame()

      log("Checking connection state")
      const connectionState = await mqttView.findWebElement(By.className("status"))
      expect(await connectionState.getText()).to.equal("ONLINE")
      await mqttView.switchBack()
    })
  })
})
