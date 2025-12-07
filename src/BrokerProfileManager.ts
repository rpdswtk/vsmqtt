import MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"
import * as vscode from "vscode"

class BrokerProfileManager {
  public static async saveBrokerProfile(newProfile: MqttBrokerConfig): Promise<void> {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const brokerProfiles = config.get<Array<MqttBrokerConfig>>("brokerProfiles")

    if (brokerProfiles) {
      const index = brokerProfiles?.findIndex((profile) => profile.name === newProfile.name)

      if (index !== undefined && index !== -1) {
        brokerProfiles[index] = newProfile
      } else {
        brokerProfiles.push(newProfile)
      }

      await config.update("brokerProfiles", brokerProfiles)
    }
  }

  public static async removeBrokerProfile(brokerProfile: MqttBrokerConfig): Promise<void> {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const brokerProfiles = config.get<Array<MqttBrokerConfig>>("brokerProfiles")

    if (brokerProfiles) {
      const index = brokerProfiles?.findIndex((profile) => profile.name === brokerProfile.name)

      if (index !== undefined && index !== -1) {
        brokerProfiles.splice(index, 1)

        await config.update("brokerProfiles", brokerProfiles)
      }
    }
  }

  public static loadBrokerProfiles(): MqttBrokerConfig[] | undefined {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const brokerProfiles = config.get<Array<MqttBrokerConfig>>("brokerProfiles")

    return brokerProfiles
  }
}

export default BrokerProfileManager
