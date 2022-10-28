import { QuickPickItem } from "vscode"
import { MqttBrokerConfig } from "./MqttBrokerConfig"

export interface MqttProfileQuickPickItem
  extends QuickPickItem,
    MqttBrokerConfig {}
