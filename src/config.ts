import * as vscode from "vscode"
import type MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"

export function getStorageTarget(): vscode.ConfigurationTarget {
  const config = vscode.workspace.getConfiguration("vsmqtt")
  const target = config.get<string>("profileStorageTarget", "workspace")
  return target === "user" ? vscode.ConfigurationTarget.Global : vscode.ConfigurationTarget.Workspace
}

export async function detectProfileScopeConflict(): Promise<void> {
  const config = vscode.workspace.getConfiguration("vsmqtt")
  const target = config.get<string>("profileStorageTarget", "workspace")

  if (target !== "user") return

  const inspection = config.inspect<Array<MqttBrokerConfig>>("brokerProfiles")
  const hasWorkspaceCopy = (inspection?.workspaceValue?.length ?? 0) > 0
  const hasUserCopy = (inspection?.globalValue?.length ?? 0) > 0

  if (hasWorkspaceCopy) {
    const action = await vscode.window.showWarningMessage(
      'VSMqtt: Broker profiles exist in both Workspace and User settings. Workspace profiles take precedence and may shadow your User profiles.',
      'Migrate to User & clear Workspace',
      'Dismiss'
    )

    if (action === 'Migrate to User & clear Workspace') {
      await migrateProfilesToUser(config, inspection)
    }
  }
}

async function migrateProfilesToUser(
  config: vscode.WorkspaceConfiguration,
  inspection: any | undefined
): Promise<void> {
  const workspaceProfiles = inspection?.workspaceValue ?? []
  const userProfiles = inspection?.globalValue ?? []

  const merged = mergeProfilesByName(userProfiles, workspaceProfiles)

  await config.update('brokerProfiles', merged, vscode.ConfigurationTarget.Global)
  await config.update('brokerProfiles', undefined, vscode.ConfigurationTarget.Workspace)

  vscode.window.showInformationMessage(
    `VSMqtt: Migrated ${merged.length} broker profile(s) to User Settings.`
  )
}

function mergeProfilesByName(
  base: Array<MqttBrokerConfig> = [],
  override: Array<MqttBrokerConfig> = []
): Array<MqttBrokerConfig> {
  const map = new Map<string, MqttBrokerConfig>()

  for (const p of base) {
    if (p && p.name) map.set(p.name, p)
  }

  // override entries win (workspace wins in our decision)
  for (const p of override) {
    if (p && p.name) map.set(p.name, p)
  }

  return Array.from(map.values())
}
