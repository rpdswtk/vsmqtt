import MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"
import { QuickPickItem } from "vscode"

export interface MqttProfileQuickPickItem extends QuickPickItem, MqttBrokerConfig {}
