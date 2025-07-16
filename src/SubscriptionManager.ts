import * as vscode from "vscode"
import MqttSubscription from "@common/interfaces/MqttSubscription"
import MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"

export class SubscriptionManager {
  public static async saveSubscription(
    brokerProfileName: string,
    subscription: MqttSubscription
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const brokerProfiles = config.get<Array<MqttBrokerConfig>>("brokerProfiles")
    const brokerProfile = brokerProfiles?.find((profile) => profile.name === brokerProfileName)
    if (brokerProfile) {
      if (!brokerProfile.savedSubscriptions) {
        brokerProfile.savedSubscriptions = []
      }

      const index = brokerProfile.savedSubscriptions.findIndex((s) => s.topic === subscription.topic)

      if (index === -1) {
        brokerProfile.savedSubscriptions.push(subscription)
      } else {
        brokerProfile.savedSubscriptions[index] = subscription
      }

      await config.update("brokerProfiles", brokerProfiles)
    }
  }

  public static async removeSavedSubscription(
    brokerProfileName: string,
    subscription: MqttSubscription
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const brokerProfiles = config.get<Array<MqttBrokerConfig>>("brokerProfiles")
    const brokerProfile = brokerProfiles?.find((profile) => profile.name === brokerProfileName)

    if (brokerProfile && brokerProfile.savedSubscriptions) {
      const index = brokerProfile.savedSubscriptions.findIndex((s) => s.topic === subscription.topic)

      if (index > -1) {
        brokerProfile.savedSubscriptions.splice(index, 1)

        await config.update("brokerProfiles", brokerProfiles)
      }
    }
  }
}
