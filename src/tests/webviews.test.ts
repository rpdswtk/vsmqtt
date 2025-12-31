import { expect } from "chai"
import { By, EditorView, InputBox, Key, WebView, Workbench } from "vscode-extension-tester"
import { log } from "./utils/logging.js"
import sleep from "./utils/sleep.js"
import { closeWorkSpace, createSettingsWithProfile, initWorkspace, openWorkSpace } from "./utils/workspace.js"

describe("Webviews", function () {
  let projectPath: string

  const openview = async () => {
    await createSettingsWithProfile(projectPath)
    await openWorkSpace(projectPath)

    log("Connecting to mqtt broker")
    await new Workbench().executeCommand("Connect to mqtt broker")
    const input = await InputBox.create()

    log("Selecting broker profile")
    await input.selectQuickPick(0)

    log("Opening mqtt webview")
    const webview = await new EditorView().openEditor("VSMQTT")
    await webview.wait(10000)
    const mqttView = new WebView()
    await mqttView.switchToFrame()

    return mqttView
  }

  this.beforeEach(async function () {
    log(`Starting test setup for: ${this.currentTest?.title || "unknown"}`)
    projectPath = await initWorkspace(__dirname)
  })

  this.afterEach(async function () {
    await closeWorkSpace(this.currentTest)
    log(`Finished test cleanup for: ${this.currentTest?.title || "unknown"}`)
  })

  it("Renders each section", async function () {
    const mqttView = await openview()

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(await mqttView.findWebElement(By.className("status"))).to.exist
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(await mqttView.findWebElement(By.className("publish-options"))).to.exist
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(await mqttView.findWebElement(By.className("subscription-options"))).to.exist
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(await mqttView.findWebElement(By.id("message-section"))).to.exist
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(await mqttView.findWebElement(By.id("message-overview-section"))).to.exist

    await mqttView.switchBack()
  })

  describe("Publish and Subscribe", function () {
    const TOPIC = "testTopic"

    it("Subscribes to topic", async function () {
      const mqttView = await openview()
      const subscribeTopicInput = await mqttView.findWebElement(By.id("subscribe-topic-input"))

      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)

      const subscriptionElementTopic = await mqttView.findWebElement(By.css(".topic-label"))

      const topic = await subscriptionElementTopic.getAttribute("innerText")

      expect(topic).to.contain(TOPIC)

      await mqttView.switchBack()
    })

    it("Sends and receives message", async function () {
      const mqttView = await openview()

      const subscribeTopicInput = await mqttView.findWebElement(By.id("subscribe-topic-input"))
      const topicInput = await mqttView.findWebElement(By.id("publish-topic-input"))
      const payloadInput = await mqttView.findWebElement(By.id("payload-input"))
      const publishButton = await mqttView.findWebElement(By.id("publish-button"))

      log("Subscribing to topic")
      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)

      log("Publishing message")
      await topicInput.sendKeys(TOPIC)
      await payloadInput.sendKeys("hello")
      await publishButton.click()

      await sleep(500)

      log("Verifying received message")
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
      const topicInput = await mqttView.findWebElement(By.id("publish-topic-input"))
      const payloadInput = await mqttView.findWebElement(By.id("payload-input"))
      const publishButton = await mqttView.findWebElement(By.id("publish-button"))

      log("Subscribing to topic")
      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)

      log("Publishing message")
      await topicInput.sendKeys(TOPIC)
      await payloadInput.sendKeys("hello")
      await publishButton.click()

      await sleep(500)
      log("Opening message details")
      const listItem = await mqttView.findWebElement(By.css(".message-list .list-item"))

      await listItem.click()

      await sleep(500)

      log("Verifying message details")
      const messageOverview = await mqttView.findWebElement(By.className("message-details"))

      const topic = await messageOverview.findElement(By.className("topic")).getAttribute("innerText")
      expect(topic).to.equal(TOPIC)

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
      const topicInput = await mqttView.findWebElement(By.id("publish-topic-input"))
      const payloadInput = await mqttView.findWebElement(By.id("payload-input"))
      const publishButton = await mqttView.findWebElement(By.id("publish-button"))

      log("Subscribing to topic")
      await subscribeTopicInput.sendKeys(TOPIC)
      await subscribeTopicInput.sendKeys(Key.ENTER)

      await sleep(500)

      log("Unsubscribing from topic")
      const unsubscribeButton = await mqttView.findWebElement(
        By.css("#subscription-list-section .list-item .unsub")
      )

      await unsubscribeButton.click()

      await sleep(500)

      log("Publishing message")
      await topicInput.sendKeys(TOPIC)
      await payloadInput.sendKeys("hello")
      await publishButton.click()

      await mqttView.switchBack()

      log("Verifying no messages received")
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
