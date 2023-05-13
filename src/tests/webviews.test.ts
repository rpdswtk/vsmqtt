/* eslint-disable @typescript-eslint/no-var-requires */
import { expect } from "chai"
const path = require("path")

import {
  By,
  EditorView,
  InputBox,
  Key,
  WebView,
  Workbench,
} from "vscode-extension-tester"
import { TEST_PROJECT_FOLDER } from "./utils/constants"
import {
  cleanWorkspace,
  createSettingsWithProfile,
  initWorkspace,
} from "./utils/workspace"
import sleep from "./utils/sleep"

describe("Webviews", function () {
  const projectPath = path.join(__dirname, TEST_PROJECT_FOLDER)

  const openview = async () => {
    createSettingsWithProfile(projectPath)

    await new Workbench().executeCommand("Connect to mqtt broker")
    const input = await InputBox.create()
    await input.selectQuickPick(0)

    const webview = await new EditorView().openEditor("VSMQTT")
    webview.wait()
    const mqttView = new WebView()
    await mqttView.switchToFrame()

    return mqttView
  }

  this.beforeEach(async function () {
    await initWorkspace(__dirname)
  })

  this.afterEach(async function () {
    await cleanWorkspace(__dirname)
  })

  it("Renders each section", async function () {
    const mqttView = await openview()

    expect(await mqttView.findWebElement(By.className("state"))).to.exist
    expect(await mqttView.findWebElement(By.className("publish-options"))).to
      .exist
    expect(await mqttView.findWebElement(By.className("subscription-options")))
      .to.exist
    expect(await mqttView.findWebElement(By.id("message-section"))).to.exist
    expect(await mqttView.findWebElement(By.id("message-overview-section"))).to
      .exist

    await mqttView.switchBack()
  })

  describe("Publish and Subscribe", function () {
    const TOPIC = "testTopic"

    it("Subscribes to topic", async function () {
      const mqttView = await openview()
      const subscribeTopicInput = await mqttView.findWebElement(
        By.id("subscribe-topic-input")
      )

      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)

      const subscriptionElementTopic = await mqttView.findWebElement(
        By.css(".list-item .topic")
      )

      expect(await subscriptionElementTopic.getText()).to.equal(TOPIC)

      await mqttView.switchBack()
    })

    it("Sends and receives message", async function () {
      const mqttView = await openview()

      const subscribeTopicInput = await mqttView.findWebElement(
        By.id("subscribe-topic-input")
      )
      const topicInput = await mqttView.findWebElement(By.id("topic-input"))
      const payloadInput = await mqttView.findWebElement(By.id("payload-input"))
      const publishButton = await mqttView.findWebElement(
        By.id("publish-button")
      )

      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)
      await topicInput.sendKeys(TOPIC)
      await payloadInput.sendKeys("hello")
      await publishButton.click()

      await sleep(500)

      const subscriptionElementMessageCount = await mqttView.findWebElement(
        By.css(".list-item .msg-cnt")
      )
      const subscriptionElementTopic = await mqttView.findWebElement(
        By.css(".list-item .topic")
      )
      const messageListItem = await mqttView.findWebElement(
        By.css(".message-list .list-item")
      )

      expect(await subscriptionElementMessageCount.getText()).to.equal("1")
      expect(await subscriptionElementTopic.getText()).to.equal(TOPIC)

      expect(
        await messageListItem.findElement(By.className("topic")).getText()
      ).to.equal(TOPIC)
      expect(
        await messageListItem.findElement(By.className("payload")).getText()
      ).to.equal("hello")
      expect(
        await messageListItem.findElement(By.className("qos")).getText()
      ).to.equal("QoS 0")

      await mqttView.switchBack()
    })

    it("Displays message details", async function () {
      const mqttView = await openview()

      const subscribeTopicInput = await mqttView.findWebElement(
        By.id("subscribe-topic-input")
      )
      const topicInput = await mqttView.findWebElement(By.id("topic-input"))
      const payloadInput = await mqttView.findWebElement(By.id("payload-input"))
      const publishButton = await mqttView.findWebElement(
        By.id("publish-button")
      )

      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)
      await topicInput.sendKeys(TOPIC)
      await payloadInput.sendKeys("hello")
      await publishButton.click()

      await sleep(500)

      const listItem = await mqttView.findWebElement(
        By.css(".message-list .list-item")
      )

      await listItem.click()

      await sleep(500)

      const messageOverview = await mqttView.findWebElement(
        By.className("message-details")
      )
      expect(
        await messageOverview.findElement(By.className("topic")).getText()
      ).to.equal(TOPIC)
      expect(await messageOverview.findElement(By.className("timestamp"))).to
        .exist
      expect(
        await messageOverview.findElement(By.className("qos")).getText()
      ).to.equal("QoS 0")
      expect(
        await messageOverview
          .findElement(By.className("payload"))
          .getAttribute("value")
      ).to.equal("hello")

      await mqttView.switchBack()
    })

    it("Unsubscribe works", async function () {
      const mqttView = await openview()

      const subscribeTopicInput = await mqttView.findWebElement(
        By.id("subscribe-topic-input")
      )
      const topicInput = await mqttView.findWebElement(By.id("topic-input"))
      const payloadInput = await mqttView.findWebElement(By.id("payload-input"))
      const publishButton = await mqttView.findWebElement(
        By.id("publish-button")
      )

      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)

      await sleep(500)

      const unsubscribeButton = await mqttView.findWebElement(
        By.css("#subscription-list-section .list-item .unsub")
      )

      await unsubscribeButton.click()

      await sleep(500)

      await topicInput.sendKeys(TOPIC)
      await payloadInput.sendKeys("hello")
      await publishButton.click()

      await mqttView.switchBack()

      const subscriptionElements = await mqttView.findWebElements(
        By.css("#subscription-list-section .list-item")
      )

      const messageListItems = await mqttView.findWebElements(
        By.css(".message-list .list-item")
      )

      expect(subscriptionElements).to.length(0)
      expect(messageListItems).to.length(0)

      await mqttView.switchBack()
    })
  })
})
