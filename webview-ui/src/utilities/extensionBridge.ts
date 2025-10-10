import type MQTTMessage from "@common/interfaces/MqttMessage"
import { vscode } from "./vscode"
import type MqttSubscription from "@common/interfaces/MqttSubscription"
import ExtensionMessages from "@common/constants/ExtensionMessages"

export default class ExtensionHostBridge {
  public static openMessage(message: MQTTMessage): void {
    vscode.postMessage({
      type: ExtensionMessages.openMessage,
      value: message,
    })
  }

  public static clearRetainedTopic(topic: string): void {
    vscode.postMessage({
      type: ExtensionMessages.clearRetainedTopic,
      value: { topic },
    })
  }

  public static publishMessage(topic: string, payload: string, qos: number, retain: boolean): void {
    vscode.postMessage({
      type: ExtensionMessages.publish,
      value: {
        topic,
        payload,
        qos,
        retain,
      },
    })
  }

  public static subscribeToTopic(topic: string, qos: number): void {
    vscode.postMessage({
      type: ExtensionMessages.subscribe,
      value: {
        topic,
        qos,
      },
    })
  }

  public static unsubscribeFromTopic(topic: string): void {
    vscode.postMessage({
      type: ExtensionMessages.unsubscribe,
      value: { topic },
    })
  }

  public static saveSubscription(profileName: string, subscription: MqttSubscription): void {
    vscode.postMessage({
      type: ExtensionMessages.saveSubscription,
      value: {
        profileName,
        subscription,
      },
    })
  }

  public static removeSavedSubscription(profileName: string, subscription: MqttSubscription): void {
    vscode.postMessage({
      type: ExtensionMessages.removeSavedSubscription,
      value: {
        profileName,
        subscription,
      },
    })
  }

  public static exportMessages(topic: string, messages: MQTTMessage[]): void {
    vscode.postMessage({
      type: ExtensionMessages.exportMessages,
      value: {
        messages,
        topic,
      },
    })
  }
}
