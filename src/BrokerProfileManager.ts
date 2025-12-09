import MqttBrokerConfig, { DefaultsForPublish } from "@common/interfaces/MqttBrokerConfig"
import * as vscode from "vscode"

class BrokerProfileManager {
  public static async saveBrokerProfile(newProfile: MqttBrokerConfig): Promise<void> {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const brokerProfiles = this.getBrokerProfiles(config)

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
    const brokerProfiles = this.getBrokerProfiles(config)

    if (brokerProfiles) {
      const index = brokerProfiles?.findIndex((profile) => profile.name === brokerProfile.name)

      if (index !== undefined && index !== -1) {
        brokerProfiles.splice(index, 1)

        await config.update("brokerProfiles", brokerProfiles)
      }
    }
  }

  public static loadBrokerProfiles(): MqttBrokerConfig[] | undefined {
    return this.getBrokerProfiles()
  }

  public static async saveDefaultsForPublish(
    profileName: string,
    defaults: DefaultsForPublish
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const brokerProfiles = this.getBrokerProfiles(config)

    const profile = brokerProfiles?.find((profile) => profile.name === profileName)

    if (profile) {
      profile.defaultsForPublish = defaults
      await config.update("brokerProfiles", brokerProfiles)
    }
  }

  private static getBrokerProfiles(
    configuration: vscode.WorkspaceConfiguration | null = null
  ): MqttBrokerConfig[] | undefined {
    const config = configuration ?? vscode.workspace.getConfiguration("vsmqtt")

    return config.get<Array<MqttBrokerConfig>>("brokerProfiles")
  }
}

export default BrokerProfileManager
