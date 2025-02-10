import { expect } from "chai"

import { By, EditorView, InputBox, Key, WebView, Workbench } from "vscode-extension-tester"
import { closeWorkSpace, createSettingsWithProfile, initWorkspace } from "./utils/workspace.js"
import sleep from "./utils/sleep.js"

describe("Webviews", function () {
  let projectPath: string

  const openview = async () => {
    await createSettingsWithProfile(projectPath)

    await new Workbench().executeCommand("Connect to mqtt broker")
    const input = await InputBox.create()
    await input.selectQuickPick(0)

    const webview = await new EditorView().openEditor("VSMQTT")
    webview.wait(10000)
    const mqttView = new WebView()
    await mqttView.switchToFrame()

    return mqttView
  }

  this.beforeEach(async function () {
    projectPath = await initWorkspace(__dirname)
  })

  this.afterEach(async function () {
    await closeWorkSpace(this.currentTest)
  })

  it("Renders each section", async function () {
    const mqttView = await openview()

    expect(await mqttView.findWebElement(By.className("state"))).to.exist
    expect(await mqttView.findWebElement(By.className("publish-options"))).to.exist
    expect(await mqttView.findWebElement(By.className("subscription-options"))).to.exist
    expect(await mqttView.findWebElement(By.id("message-section"))).to.exist
    expect(await mqttView.findWebElement(By.id("message-overview-section"))).to.exist

    await mqttView.switchBack()
  })

  describe("Publish and Subscribe", function () {
    const TOPIC = "testTopic"

    it("Subscribes to topic", async function () {
      console.log("HELLO")
      const mqttView = await openview()
      const subscribeTopicInput = await mqttView.findWebElement(By.id("subscribe-topic-input"))

      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)

      const subscriptionElementTopic = await mqttView.findWebElement(By.css(".list-item .topic"))

      const topic = await subscriptionElementTopic.getAttribute("innerText")

      expect(topic).to.equal(TOPIC)

      await mqttView.switchBack()
    })

    it("Sends and receives message", async function () {
      const mqttView = await openview()

      const subscribeTopicInput = await mqttView.findWebElement(By.id("subscribe-topic-input"))
      const topicInput = await mqttView.findWebElement(By.id("topic-input"))
      const payloadInput = await mqttView.findWebElement(By.id("payload-input"))
      const publishButton = await mqttView.findWebElement(By.id("publish-button"))

      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)
      await topicInput.sendKeys(TOPIC)
      await payloadInput.sendKeys("hello")
      await publishButton.click()

      await sleep(500)

      const subscriptionElementMessageCount = await mqttView.findWebElement(By.css(".list-item .msg-cnt"))
      const subscriptionElementTopic = await mqttView.findWebElement(By.css(".list-item .topic"))
      const messageListItem = await mqttView.findWebElement(By.css(".message-list .list-item"))

      expect(await subscriptionElementMessageCount.getAttribute("innerText")).to.equal("1")
      expect(await subscriptionElementTopic.getAttribute("innerText")).to.equal(TOPIC)

      const topic = await messageListItem.findElement(By.className("topic")).getAttribute("innerText")
      expect(topic).to.equal(TOPIC)

      const payload = await messageListItem.findElement(By.className("payload")).getAttribute("innerText")
      expect(payload).to.equal("hello")

      const qos = await messageListItem.findElement(By.className("qos")).getAttribute("innerText")
      expect(qos).to.equal("QoS 0")

      await mqttView.switchBack()
    })

    it("Displays message details", async function () {
      const mqttView = await openview()

      const subscribeTopicInput = await mqttView.findWebElement(By.id("subscribe-topic-input"))
      const topicInput = await mqttView.findWebElement(By.id("topic-input"))
      const payloadInput = await mqttView.findWebElement(By.id("payload-input"))
      const publishButton = await mqttView.findWebElement(By.id("publish-button"))

      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)
      await topicInput.sendKeys(TOPIC)
      await payloadInput.sendKeys("hello")
      await publishButton.click()

      await sleep(500)

      const listItem = await mqttView.findWebElement(By.css(".message-list .list-item"))

      await listItem.click()

      await sleep(500)

      const messageOverview = await mqttView.findWebElement(By.className("message-details"))

      const topic = await messageOverview.findElement(By.className("topic")).getAttribute("innerText")
      expect(topic).to.equal(TOPIC)

      expect(await messageOverview.findElement(By.className("timestamp"))).to.exist

      const qos = await messageOverview.findElement(By.className("qos")).getAttribute("innerText")
      expect(qos).to.equal("QoS 0")

      const payload = await messageOverview.findElement(By.className("payload")).getAttribute("value")
      expect(payload).to.equal("hello")

      await mqttView.switchBack()
    })

    it("Unsubscribe works", async function () {
      const mqttView = await openview()

      const subscribeTopicInput = await mqttView.findWebElement(By.id("subscribe-topic-input"))
      const topicInput = await mqttView.findWebElement(By.id("topic-input"))
      const payloadInput = await mqttView.findWebElement(By.id("payload-input"))
      const publishButton = await mqttView.findWebElement(By.id("publish-button"))

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

      const messageListItems = await mqttView.findWebElements(By.css(".message-list .list-item"))

      expect(subscriptionElements).to.length(0)
      expect(messageListItems).to.length(0)

      await mqttView.switchBack()
    })
  })
})
