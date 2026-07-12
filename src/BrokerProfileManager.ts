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

      await config.update("brokerProfiles", brokerProfiles, this.getStorageTarget())
    }
  }

  public static async removeBrokerProfile(brokerProfile: MqttBrokerConfig): Promise<void> {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const brokerProfiles = this.getBrokerProfiles(config)

    if (brokerProfiles) {
      const index = brokerProfiles?.findIndex((profile) => profile.name === brokerProfile.name)

      if (index !== undefined && index !== -1) {
        brokerProfiles.splice(index, 1)

        await config.update("brokerProfiles", brokerProfiles, this.getStorageTarget())
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
      await config.update("brokerProfiles", brokerProfiles, this.getStorageTarget())
    }
  }

  public static async detectProfileScopeConflict(): Promise<void> {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const target = config.get<string>("profileStorageTarget", "workspace")

    // inspect() returns raw per-scope values without merging
    const inspection = config.inspect<MqttBrokerConfig[]>("brokerProfiles")
    const workspaceProfiles = inspection?.workspaceValue ?? []
    const userProfiles = inspection?.globalValue ?? []

    if (target === "user") {
      // Workspace → User: leftover workspace copy shadows user scope
      const hasWorkspaceCopy = workspaceProfiles.length > 0
      if (!hasWorkspaceCopy) {
        return
      }

      const overlap = workspaceProfiles.filter((wp) => userProfiles.some((up) => up.name === wp.name))

      if (overlap.length === 0) {
        await BrokerProfileManager.promptNoOverlapWorkspaceToUser(config, workspaceProfiles, userProfiles)
      } else {
        await BrokerProfileManager.promptWithOverlapWorkspaceToUser(
          config,
          overlap,
          workspaceProfiles,
          userProfiles
        )
      }
    } else {
      // User → Workspace: leftover user copy will silently diverge
      const hasUserCopy = userProfiles.length > 0
      if (!hasUserCopy) {
        return
      }

      const overlap = userProfiles.filter((up) => workspaceProfiles.some((wp) => wp.name === up.name))

      if (overlap.length === 0) {
        await BrokerProfileManager.promptNoOverlapUserToWorkspace(config, workspaceProfiles, userProfiles)
      } else {
        await BrokerProfileManager.promptWithOverlapUserToWorkspace(
          config,
          overlap,
          workspaceProfiles,
          userProfiles
        )
      }
    }
  }

  public static getStorageTarget(): vscode.ConfigurationTarget {
    const config = vscode.workspace.getConfiguration("vsmqtt")
    const target = config.get<string>("profileStorageTarget", "workspace")
    return target === "user" ? vscode.ConfigurationTarget.Global : vscode.ConfigurationTarget.Workspace
  }

  private static getBrokerProfiles(
    configuration: vscode.WorkspaceConfiguration | null = null
  ): MqttBrokerConfig[] | undefined {
    const config = configuration ?? vscode.workspace.getConfiguration("vsmqtt")

    // config.get() merges both User and Workspace scopes automatically
    return config.get<Array<MqttBrokerConfig>>("brokerProfiles")
  }

  private static async promptNoOverlapWorkspaceToUser(
    config: vscode.WorkspaceConfiguration,
    workspaceProfiles: MqttBrokerConfig[],
    userProfiles: MqttBrokerConfig[]
  ): Promise<void> {
    const action = await vscode.window.showWarningMessage(
      `VSMqtt: ${workspaceProfiles.length} broker profile(s) are still in Workspace Settings. ` +
        `Migrate them to User Settings and remove the Workspace copy?`,
      { modal: false },
      "Migrate",
      "Not Now"
    )

    if (action === "Migrate") {
      const merged = [...userProfiles, ...workspaceProfiles] // no dedup needed — no overlap
      await BrokerProfileManager.migrateWorkspaceToUserAndClearWorkspace(config, merged)
    }
  }

  private static async promptWithOverlapWorkspaceToUser(
    config: vscode.WorkspaceConfiguration,
    overlap: MqttBrokerConfig[],
    workspaceProfiles: MqttBrokerConfig[],
    userProfiles: MqttBrokerConfig[]
  ): Promise<void> {
    const action = await vscode.window.showWarningMessage(
      `VSMqtt: ${overlap.length} broker profile(s) exist in both Workspace and User Settings ` +
        `with potentially different values. Which version should be kept?`,
      { modal: true },
      "Keep Workspace versions",
      "Keep User versions",
      "Cancel"
    )

    if (action === "Cancel" || action === undefined) {
      return
    }

    const choice = action === "Keep Workspace versions" ? workspaceProfiles : userProfiles

    // For non-overlapping profiles, include them from both scopes regardless
    const nonOverlapUser = userProfiles.filter((up) => !overlap.some((o) => o.name === up.name))
    const nonOverlapWorkspace = workspaceProfiles.filter((wp) => !overlap.some((o) => o.name === wp.name))
    const merged = [...choice, ...nonOverlapUser, ...nonOverlapWorkspace]

    await BrokerProfileManager.migrateWorkspaceToUserAndClearWorkspace(config, merged)
  }

  private static async migrateWorkspaceToUserAndClearWorkspace(
    config: vscode.WorkspaceConfiguration,
    merged: MqttBrokerConfig[]
  ): Promise<void> {
    await config.update("brokerProfiles", merged, vscode.ConfigurationTarget.Global)
    await config.update("brokerProfiles", undefined, vscode.ConfigurationTarget.Workspace)

    vscode.window.showInformationMessage(
      `VSMqtt: Migrated ${merged.length} broker profile(s) to User Settings.`
    )
  }

  private static async promptNoOverlapUserToWorkspace(
    config: vscode.WorkspaceConfiguration,
    workspaceProfiles: MqttBrokerConfig[],
    userProfiles: MqttBrokerConfig[]
  ): Promise<void> {
    const action = await vscode.window.showWarningMessage(
      `VSMqtt: ${userProfiles.length} broker profile(s) are in User Settings. ` +
        `Copy them to this Workspace?`,
      { modal: false },
      "Copy & remove from User Settings",
      "Copy only",
      "Not Now"
    )

    if (action === "Copy & remove from User Settings") {
      const merged = [...workspaceProfiles, ...userProfiles]
      await BrokerProfileManager.migrateUserToWorkspaceAndClearUser(config, merged)
    } else if (action === "Copy only") {
      const merged = [...workspaceProfiles, ...userProfiles]
      await config.update("brokerProfiles", merged, vscode.ConfigurationTarget.Workspace)
      vscode.window.showInformationMessage(
        `VSMqtt: Copied ${userProfiles.length} profile(s) to Workspace Settings. ` +
          `User Settings copy retained.`
      )
    }
  }

  private static async promptWithOverlapUserToWorkspace(
    config: vscode.WorkspaceConfiguration,
    overlap: MqttBrokerConfig[],
    workspaceProfiles: MqttBrokerConfig[],
    userProfiles: MqttBrokerConfig[]
  ): Promise<void> {
    const action = await vscode.window.showWarningMessage(
      `VSMqtt: ${overlap.length} broker profile(s) exist in both User and Workspace Settings ` +
        `with potentially different values. ` +
        `Note: removing from User Settings affects all workspaces.`,
      { modal: true },
      "Keep Workspace versions & remove User copy",
      "Keep User versions & remove User copy",
      "Keep User versions, copy only",
      "Cancel"
    )

    if (action === "Cancel" || action === undefined) {
      return
    }

    const nonOverlapUser = userProfiles.filter((up) => !overlap.some((o) => o.name === up.name))
    const nonOverlapWorkspace = workspaceProfiles.filter((wp) => !overlap.some((o) => o.name === wp.name))

    if (action === "Keep User versions, copy only") {
      // Copy user versions into workspace without touching user scope
      const merged = [...userProfiles, ...nonOverlapWorkspace]
      await config.update("brokerProfiles", merged, vscode.ConfigurationTarget.Workspace)
      vscode.window.showInformationMessage(
        `VSMqtt: Copied ${merged.length} profile(s) to Workspace Settings. User Settings copy retained.`
      )
      return
    }

    const winner = action === "Keep Workspace versions & remove User copy" ? workspaceProfiles : userProfiles

    const merged = [...winner, ...nonOverlapUser, ...nonOverlapWorkspace]
    await BrokerProfileManager.migrateUserToWorkspaceAndClearUser(config, merged)
  }

  private static async migrateUserToWorkspaceAndClearUser(
    config: vscode.WorkspaceConfiguration,
    merged: MqttBrokerConfig[]
  ): Promise<void> {
    // Write to workspace FIRST — never clear user scope before the workspace copy is safe
    await config.update("brokerProfiles", merged, vscode.ConfigurationTarget.Workspace)
    await config.update("brokerProfiles", undefined, vscode.ConfigurationTarget.Global)

    vscode.window.showInformationMessage(
      `VSMqtt: Migrated ${merged.length} broker profile(s) to Workspace Settings. ` +
        `User Settings copy removed.`
    )
  }
}

export default BrokerProfileManager
