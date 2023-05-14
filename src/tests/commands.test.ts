/* eslint-disable @typescript-eslint/no-var-requires */
const expect = require("chai").expect
const path = require("path")
import * as fs from "node:fs"
import {
  Workbench,
  InputBox,
  VSBrowser,
  ModalDialog,
  WebView,
  By,
} from "vscode-extension-tester"
import sleep from "./utils/sleep"
import { EditorView } from "vscode-extension-tester"
import { BROKER_PROFILE } from "./utils/constants"
import { createSettingsWithProfile, initWorkspace } from "./utils/workspace"

describe("Commands", function () {
  let projectPath: string

  this.beforeEach(async function () {
    projectPath = await initWorkspace(__dirname)
  })

  this.afterEach(async function () {
    await new Workbench().executeCommand("close workspace")
  })

  describe("Add broker profile", () => {
    it("saves profile to settings.json", async function () {
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
      const rawData = fs.readFileSync(
        path.join(projectPath, ".vscode/settings.json")
      )
      const settings = JSON.parse(rawData.toString())

      const savedProfile = settings["vsmqtt.brokerProfiles"][0]

      expect(savedProfile.name).to.equal(BROKER_PROFILE.name)
      expect(savedProfile.host).to.equal(BROKER_PROFILE.host)
      expect(savedProfile.port).to.equal(BROKER_PROFILE.port)
    })
  })

  describe("Remove broker profile", () => {
    it("removes profile from settings.json", async function () {
      await createSettingsWithProfile(projectPath)

      await new Workbench().executeCommand("remove broker profile")
      const input = await InputBox.create()
      await sleep(2000)

      await input.selectQuickPick(0)

      await sleep(2000)

      const dialog = new ModalDialog()
      await VSBrowser.instance.waitForWorkbench()
      await dialog.pushButton("Yes")

      console.log("Opening settings.json")
      await VSBrowser.instance.openResources(
        path.join(projectPath, ".vscode/settings.json")
      )

      console.log("Opening editor")
      const settingsFile = await new EditorView().openEditor("settings.json")

      const settingsText = await settingsFile.getText()

      const settings = JSON.parse(settingsText)

      expect(settings["vsmqtt.brokerProfiles"]).to.not.deep.include.members([
        BROKER_PROFILE,
      ])
    })
  })

  describe("Edit broker profile", () => {
    it("opens settings.json", async function () {
      await new Workbench().executeCommand("edit broker profile")
      await sleep(2000)

      const editorView = new EditorView()

      const titles = await editorView.getOpenEditorTitles()

      expect(titles).to.contain("settings.json")
    })
  })

  describe("Connect to mqtt broker", () => {
    it("connects to broker", async function () {
      await createSettingsWithProfile(projectPath)

      await new Workbench().executeCommand("Connect to mqtt broker")
      const input = await InputBox.create()
      await input.selectQuickPick(0)

      const webview = await new EditorView().openEditor("VSMQTT")
      webview.wait()
      const mqttView = new WebView()
      await mqttView.switchToFrame()

      const connectionState = await mqttView.findWebElement(
        By.className("state")
      )
      expect(await connectionState.getText()).to.equal("Connected")
      await mqttView.switchBack()
    })

    it("prompts for password", async function () {
      await createSettingsWithProfile(projectPath, { promptCredentials: true })
      await new Workbench().executeCommand("Connect to mqtt broker")
      const input = await InputBox.create()
      await input.selectQuickPick(0)

      await sleep(2000)

      expect(
        await (await input.getMessage()).startsWith("Username"),
        "Should be username"
      ).to.be.true
      await input.setText("user")
      await input.confirm()

      await input.wait()
      expect(
        await (await input.getMessage()).startsWith("Password"),
        "Should be password"
      ).to.be.true
      await input.cancel()
    })

    it("connects to broker using websocket", async function () {
      await createSettingsWithProfile(projectPath, {
        host: "ws://localhost",
        port: 8083,
        protocol: "ws",
      })

      await new Workbench().executeCommand("Connect to mqtt broker")
      const input = await InputBox.create()
      await input.selectQuickPick(0)

      const webview = await new EditorView().openEditor("VSMQTT")
      webview.wait()
      const mqttView = new WebView()
      await mqttView.switchToFrame()

      const connectionState = await mqttView.findWebElement(
        By.className("state")
      )
      expect(await connectionState.getText()).to.equal("Connected")
      await mqttView.switchBack()
    })
  })
})
