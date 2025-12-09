import ExtensionMessages from "@common/constants/ExtensionMessages"
import MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"
import * as moment from "moment"
import { MqttClient } from "mqtt"
import { IPublishPacket } from "mqtt-packet"
import * as vscode from "vscode"
import BrokerProfileManager from "../BrokerProfileManager"
import { openMqttMessageInEditor, saveMessageLog } from "../helpers"
import { MqttClientFactory } from "../MqttClientFactory"
import { SubscriptionManager } from "../SubscriptionManager"
import { showProgressNotification } from "../utils/window"
import { getNonce, getUri } from "../webViewUtils"

export class MqttConnectionView {
  public static readonly viewType = "mqtt-connection"

  public brokerConfig: MqttBrokerConfig
  public readonly _panel: vscode.WebviewPanel
  private readonly _extensionUri: vscode.Uri
  private _disposables: vscode.Disposable[] = []
  private _mqttClient?: MqttClient
  private _loadingNotificationCancellationToken: vscode.CancellationTokenSource | undefined

  private static _openViews: Map<string, MqttConnectionView> = new Map<string, MqttConnectionView>()
  private _messageCount: number

  public static createOrShow(extensionUri: vscode.Uri, brokerConfig: MqttBrokerConfig): void {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined

    // If we already have a panel, show it.
    const existingView = MqttConnectionView._openViews.get(brokerConfig.name)
    if (existingView) {
      existingView._panel.reveal(column)
      return
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      MqttConnectionView.viewType,
      "VSMQTT",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,
        retainContextWhenHidden: true,

        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "media"),
          vscode.Uri.joinPath(extensionUri, "webview-ui/build"),
        ],
      }
    )

    panel.iconPath = {
      dark: vscode.Uri.joinPath(extensionUri, "media", "icon_light.svg"),
      light: vscode.Uri.joinPath(extensionUri, "media", "icon.svg"),
    }

    MqttConnectionView._openViews.set(
      brokerConfig.name,
      new MqttConnectionView(panel, extensionUri, brokerConfig)
    )

    MqttConnectionView._openViews.get(brokerConfig.name)?._panel.webview.postMessage({
      type: ExtensionMessages.themeInformationChange,
      value: { themeKind: vscode.window.activeColorTheme.kind },
    })
  }

  public static kill(brokerConfig: MqttBrokerConfig): void {
    MqttConnectionView._openViews.get(brokerConfig.name)?.dispose()
  }

  public static revive(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    brokerConfig: MqttBrokerConfig
  ): void {
    MqttConnectionView._openViews.set(
      brokerConfig.name,
      new MqttConnectionView(panel, extensionUri, brokerConfig)
    )
  }

  public static reveal(brokerConfig: MqttBrokerConfig): void {
    MqttConnectionView._openViews.get(brokerConfig.name)?._panel.reveal()
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, brokerConfig: MqttBrokerConfig) {
    this._panel = panel
    this._extensionUri = extensionUri
    this.brokerConfig = brokerConfig
    this._messageCount = 0
    this._loadingNotificationCancellationToken = showProgressNotification(
      `Connecting to broker at ${this.brokerConfig.host}`
    )

    // Set the webview's initial html content
    this._update()

    this._panel.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case ExtensionMessages.publish: {
          if (!data.value) {
            return
          }

          console.log(
            `Publishing to topic: ${data.value.topic} QoS: ${data.value.qos} Retain: ${data.value.retain}`
          )

          this._mqttClient?.publish(data.value.topic, data.value.payload, {
            qos: data.value.qos,
            retain: data.value.retain,
          })
          break
        }
        case ExtensionMessages.subscribe: {
          if (!data.value) {
            return
          }
          console.log(`Subscribing to topic: ${data.value.topic} QoS: ${data.value.qos}`)
          this._mqttClient?.subscribe(data.value.topic, {
            qos: data.value.qos,
          })
          break
        }
        case ExtensionMessages.unsubscribe: {
          if (!data.value) {
            return
          }

          console.log(`Unsubscribing from topic: ${data.value.topic}`)

          this._mqttClient?.unsubscribe(data.value.topic)
          break
        }
        case ExtensionMessages.saveSubscription: {
          if (!data.value) {
            return
          }

          console.log(`Saving subscription: ${JSON.stringify(data.value.subscription)}`)

          await SubscriptionManager.saveSubscription(data.value.profileName, data.value.subscription)
          break
        }
        case ExtensionMessages.removeSavedSubscription: {
          if (!data.value) {
            return
          }

          console.log(`Removing saved subscription: ${JSON.stringify(data.value.subscription)}`)

          await SubscriptionManager.removeSavedSubscription(data.value.profileName, data.value.subscription)
          break
        }
        case ExtensionMessages.exportMessages: {
          if (!data.value) {
            return
          }

          console.log(`Saving message log for topic: ${data.value.topic}`)

          saveMessageLog(data.value.messages)
          break
        }
        case ExtensionMessages.clearRetainedTopic: {
          console.log(`Clearing retained topic: ${data.value.topic}`)

          this._mqttClient?.publish(data.value.topic, "", {
            retain: true,
          })
          break
        }
        case ExtensionMessages.openMessage: {
          console.log(`Opening message: ${data.value.topic}`)

          await openMqttMessageInEditor(data.value.payload)
          break
        }
        case ExtensionMessages.saveDefaultPublishValues: {
          const value = data.value

          BrokerProfileManager.saveDefaultsForPublish(brokerConfig.name, {
            topic: value.topic,
            payload: value.payload,
            qos: value.qos,
            retain: value.retain,
          })
        }
      }
    })

    vscode.window.onDidChangeActiveColorTheme(
      (e) => {
        this._panel.webview.postMessage({
          type: ExtensionMessages.themeInformationChange,
          value: { themeKind: e.kind },
        })
      },
      null,
      this._disposables
    )

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)
  }

  public dispose(): void {
    MqttConnectionView._openViews.delete(this.brokerConfig.name)
    MqttClientFactory.disposeClient(this.brokerConfig)

    // Clean up our resources
    this._panel.webview.onDidReceiveMessage(() => {
      // do nothing
    })
    this._panel.dispose()

    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview
    this._initMqtt()
    this._panel.webview.html = this._getHtmlForWebview(webview)
  }

  private _initMqtt() {
    this._mqttClient = MqttClientFactory.createClient(this.brokerConfig)

    this._mqttClient.once("error", async (error: Error) => {
      this._loadingNotificationCancellationToken?.cancel()
      const result = await vscode.window.showErrorMessage(
        `Could not connect to ${this.brokerConfig.host} - ${error.message}`,
        "Open settings.json"
      )

      if (result) {
        await vscode.commands.executeCommand("workbench.action.openWorkspaceSettingsFile")
      }
    })

    this._mqttClient.on("message", (topic, message, packet: IPublishPacket) => {
      const timestamp = moment().format("YYYY-MM-DD h:mm:ss.SSS")
      console.log(`${timestamp} - Message received ${topic} Retain: ${packet.retain} Qos: ${packet.qos}`)
      this._panel?.webview.postMessage({
        type: ExtensionMessages.onMqttMessage,
        value: {
          id: this._messageCount++,
          topic,
          payload: message.toString(),
          qos: packet.qos,
          retain: packet.retain,
          timestamp,
        },
      })
    })

    this._mqttClient.on("connect", () => {
      this._loadingNotificationCancellationToken?.cancel()

      this._panel?.webview.postMessage({
        type: ExtensionMessages.onMqttConnectionChange,
        value: { connected: true },
      })

      this._mqttClient?.once("error", () => {
        this._panel?.webview.postMessage({
          type: ExtensionMessages.onMqttConnectionChange,
          value: { connected: false },
        })
      })
    })
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // // And the uri we use to load this script in the webview
    const scriptUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "bundle.js"])

    const stylesUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "bundle.css"])

    const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "reset.css"))

    const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css"))

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce()

    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Hello World</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
          webview.cspSource
        }; script-src 'nonce-${nonce}';">
        <script nonce="${nonce}">
          const brokerProfile = ${JSON.stringify(this.brokerConfig)};
        </script>
        <link href="${stylesResetUri}" rel="stylesheet">
        <link href="${stylesMainUri}" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="${stylesUri}">
        <script defer nonce="${nonce}" src="${scriptUri}"></script>
      </head>
      <body>
      </body>
    </html>`
  }
}
