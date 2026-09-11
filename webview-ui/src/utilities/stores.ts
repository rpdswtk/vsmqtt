import type MqttBrokerConfig from "@common/interfaces/MqttBrokerConfig"
import type MQTTMessage from "@common/interfaces/MqttMessage"
import type MqttSubscription from "@common/interfaces/MqttSubscription"
import { writable } from "svelte/store"
import type { SubscriptionItem } from "../types"

export const MAX_STORED_MESSAGES = 5000
/** Max characters rendered in the message list row; full payload is kept on the object for the detail view. */
export const PAYLOAD_PREVIEW_LENGTH = 500
export const messages = writable([] as MQTTMessage[])
export const selectedMessage = writable<MQTTMessage | undefined>()
export const subscriptions = writable(new Map<string, SubscriptionItem>())
export const savedSubscriptions = writable(new Map<string, MqttSubscription>())
export const isConnected = writable<boolean>(false)
export const brokerConfig = writable<MqttBrokerConfig | undefined>()
