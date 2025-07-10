import { QuickPickItem } from "vscode"
import MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"

export interface MqttProfileQuickPickItem extends QuickPickItem, MqttBrokerConfig {}
