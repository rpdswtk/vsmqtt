import { MqttClient, connect } from "mqtt"
import { MqttBrokerConfig } from "./interfaces/MqttBrokerConfig"
import * as fs from "fs"
import * as vscode from "vscode"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { isAbsolutePath } = require("path-validation")
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).WebSocket = require("ws") // WebSocket is not defined bugfix (mqttjs is using global websocket)

export class MqttClientFactory {
  private static clients: Map<string, MqttClient> = new Map<string, MqttClient>()

  public static createClient(config: MqttBrokerConfig): MqttClient {
    let client = MqttClientFactory.clients.get(config.name)
    if (client) {
      return client
    }

    const options = Object.assign({}, config)

    if (!options.protocol) {
      options.protocol = "mqtt"
    }

    if (options.ca) {
      if (isAbsolutePath(options.ca, "\\") || isAbsolutePath(options.ca, "/")) {
        try {
          options.ca = fs.readFileSync(options.ca)
        } catch (error) {
          options.ca = undefined
          console.error(error)
          vscode.window.showErrorMessage("Could not open cert file")
        }
      }
    }

    if (options.key) {
      if (isAbsolutePath(options.key, "\\") || isAbsolutePath(options.key, "/")) {
        try {
          options.key = fs.readFileSync(options.key)
        } catch (error) {
          options.key = undefined
          console.error(error)
          vscode.window.showErrorMessage("Could not open client key file")
        }
      }
    }

    if (options.cert) {
      if (isAbsolutePath(options.cert, "\\") || isAbsolutePath(options.cert, "/")) {
        try {
          options.cert = fs.readFileSync(options.cert)
        } catch (error) {
          options.cert = undefined
          console.error(error)
          vscode.window.showErrorMessage("Could not open client key file")
        }
      }
    }

    client = connect(options.host, options)

    MqttClientFactory.clients.set(options.name, client)

    return client
  }

  public static disposeClient(config: MqttBrokerConfig): void {
    const client = MqttClientFactory.clients.get(config.name)
    client?.removeAllListeners()
    client?.end()
    if (client) {
      MqttClientFactory.clients.delete(config.name)
    }
  }
}
